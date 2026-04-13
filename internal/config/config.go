package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       string
	OHGOAPIKey string
}

func Load() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, looking for system environment variables instead.")
	}

	return &Config{
		Port:       getEnvOrDefault("PORT", "8080"),
		OHGOAPIKey: os.Getenv("OHGO_API_KEY"),
	}
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
