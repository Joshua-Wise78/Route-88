package main

import (
	"encoding/csv"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"route88/internal/db"
	"route88/internal/discord"
	"route88/internal/ohgo"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	apiKey := os.Getenv("OHGO_API_KEY")
	if apiKey == "" {
		log.Fatal("CRITICAL: OHGO_API_KEY is not set in the environment")
	}

	dbConnStr := os.Getenv("DATABASE_URL")
	if dbConnStr == "" {
		log.Fatal("CRITICAL: DATABASE_URL is not set in the environment")
	}

	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	if webhookURL == "" {
		log.Println("WARNING: DISCORD_WEBHOOK_URL is not set, auto-alerts are disabled")
	}

	ohgoClient := ohgo.NewClient(apiKey)
	discordClient := discord.NewClient(webhookURL)

	store, err := db.NewStore(dbConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if webhookURL != "" {
		go startAlertWorker(ohgoClient, discordClient, store)
	}

	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4321", "http://127.0.0.1:4321"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	_ = r.SetTrustedProxies(nil)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	v1 := r.Group("/api/v1")
	{
		helpers := v1.Group("/helpers")
		{
			helpers.GET("/regions", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"total":   len(ohgo.ValidRegions),
					"regions": ohgo.ValidRegions,
				})
			})
		}

		traffic := v1.Group("/traffic")
		{
			traffic.GET("/incidents", func(c *gin.Context) {
				query := c.Request.URL.Query()
				incidents, err := ohgoClient.GetIncidents(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch incidents: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(incidents), "data": incidents})
			})

			traffic.GET("/delays", func(c *gin.Context) {
				query := c.Request.URL.Query()
				delays, err := ohgoClient.GetTravelDelays(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch delays: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(delays), "data": delays})
			})

			traffic.GET("/construction", func(c *gin.Context) {
				query := c.Request.URL.Query()
				construction, err := ohgoClient.GetConstruction(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch construction: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(construction), "data": construction})
			})

			traffic.GET("/cameras", func(c *gin.Context) {
				query := c.Request.URL.Query()
				cameras, err := ohgoClient.GetCameras(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cameras: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(cameras), "data": cameras})
			})

			traffic.GET("/messagesigns", func(c *gin.Context) {
				query := c.Request.URL.Query()
				messagesigns, err := ohgoClient.GetMessageSigns(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch signs: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(messagesigns), "data": messagesigns})
			})

			traffic.GET("/weather", func(c *gin.Context) {
				query := c.Request.URL.Query()
				weather, err := ohgoClient.GetWeatherSensors(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather sensors: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(weather), "data": weather})
			})
		}

		export := v1.Group("/export")
		{
			export.GET("/incidents.csv", exportIncidentsCSV(store))
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Route-88 server on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}

func exportIncidentsCSV(store *db.Store) gin.HandlerFunc {
	return func(c *gin.Context) {
		incidents, err := store.GetAllIncidents()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data from database"})
			return
		}

		c.Header("Content-Disposition", `attachment; filename="route88_incidents.csv"`)
		c.Header("Content-Type", "text/csv")
		c.Header("Transfer-Encoding", "chunked")

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		// Write Header
		if err := writer.Write([]string{"ID", "Location", "Description", "Category", "Direction", "RouteName", "RoadStatus"}); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		// Write Data
		for _, inc := range incidents {
			row := []string{
				inc.ID,
				inc.Location,
				inc.Description,
				inc.Category,
				inc.Direction,
				inc.RouteName,
				inc.RoadStatus,
			}
			if err := writer.Write(row); err != nil {
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
		}
	}
}

func startAlertWorker(ohClient *ohgo.Client, discClient *discord.Client, store *db.Store) {
	log.Println("Starting Discord auto-alert worker for incidents, delays, and construction...")

	ticker := time.NewTicker(10 * time.Minute)

	seenIncidents := make(map[string]bool)
	seenDelays := make(map[string]bool)
	seenConstruction := make(map[string]bool)

	for range ticker.C {
		query := url.Values{"region": {"dayton"}}

		incidents, err := ohClient.GetIncidents(query)
		if err == nil {
			for _, incident := range incidents {
				if dbErr := store.InsertIncident(incident); dbErr != nil {
					log.Printf("Worker failed to insert incident into db: %v\n", dbErr)
				}

				if (incident.RoadStatus == "CLOSED" || incident.RoadStatus == "Restricted") && !seenIncidents[incident.ID] {
					embed := discord.FormatIncident(incident)
					payload := discord.WebHookPayload{Username: "Route-88 Traffic Monitor", Embeds: []discord.Embed{embed}}
					if err := discClient.Send(payload); err == nil {
						seenIncidents[incident.ID] = true
					}
				}
			}
		} else {
			log.Printf("Worker failed to fetch incidents: %v\n", err)
		}

		delays, err := ohClient.GetTravelDelays(query)
		if err == nil {
			for _, delay := range delays {
				if delay.DelayTime > 5 && !seenDelays[delay.ID] {
					embed := discord.FormatDelay(delay)
					payload := discord.WebHookPayload{Username: "Route-88 Traffic Monitor", Embeds: []discord.Embed{embed}}
					if err := discClient.Send(payload); err == nil {
						seenDelays[delay.ID] = true
					}
				}
			}
		} else {
			log.Printf("Worker failed to fetch delays: %v\n", err)
		}

		construction, err := ohClient.GetConstruction(query)
		if err == nil {
			for _, c := range construction {
				if c.IsActive && !seenConstruction[c.ID] {
					embed := discord.FormatConstruction(c)
					payload := discord.WebHookPayload{Username: "Route-88 Traffic Monitor", Embeds: []discord.Embed{embed}}
					if err := discClient.Send(payload); err == nil {
						seenConstruction[c.ID] = true
					}
				}
			}
		} else {
			log.Printf("Worker failed to fetch construction: %v\n", err)
		}
	}
}
