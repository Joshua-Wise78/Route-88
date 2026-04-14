package main

import (
	"log"
	"route88/internal/config"
	"route88/internal/routes"
	"route88/internal/services"
)

func main() {
	cfg := config.Load()

	if cfg.OHGOAPIKey == "" {
		log.Fatal("CRITICAL ERROR: OHGO_API_KEY is missing from the environment")
	}

	ohgoClient := services.NewOHGOClient(cfg.OHGOAPIKey)

	router := routes.SetupRouter(ohgoClient)

	log.Printf("Starting Route-88 API on port %s...", cfg.Port)

	err := router.Run(":" + cfg.Port)
	if err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
