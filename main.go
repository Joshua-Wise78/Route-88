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
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.GET("/api/v1/incidents", func(c *gin.Context) {
		query := c.Request.URL.Query()

		incidents, err := ohgoClient.GetIncidents(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch incidents: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"total":     len(incidents),
			"incidents": incidents,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Route-88 server on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
