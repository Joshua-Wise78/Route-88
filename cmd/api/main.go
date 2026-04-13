package main

import (
	"log"
	"route88/internal/config"
	"route88/internal/routes"
)

func main() {
	cfg := config.Load()

	if cfg.OHGOAPIKey == "" {
		log.Fatal("CRITICAL ERROR: OHGO_API_KEY is missing from the environment")
	}

	log.Printf("Starting Route-88 API on port %s...", cfg.Port)

	router := routes.SetupRouter()

	err := router.Run(":" + cfg.Port)
	if err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
