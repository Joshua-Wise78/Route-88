package main

import (
	"log"
	"route88/internal/routes"
)

func main() {
	router := routes.SetupRouter()

	log.Println("Starting Route-88 API on port 8080...")
	
	router.Run(":8080")
}
