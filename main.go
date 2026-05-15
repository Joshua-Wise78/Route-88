package main

import (
	"log"
	"net/http"
	"os"

	"route88/internal/ohgo"

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

	ohgoClient := ohgo.NewClient(apiKey)

	r := gin.Default()

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
			}

			traffic.GET("/weather", func(c *gin.Context) {
				query := c.Request.URL.Query()
				weather, err := ohgoClient.GetWeatherSensors(query)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather sensors: " + err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"total": len(weather), "data": weather})
			}
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
