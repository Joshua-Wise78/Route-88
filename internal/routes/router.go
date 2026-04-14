package routes

import (
	"github.com/gin-gonic/gin"
	// Middleware and handlers will be imported here later
	"route88/internal/handlers"
	"route88/internal/services"
)

func SetupRouter(ohgoClient *services.OHGOClient) *gin.Engine {
	r := gin.Default()

	constructionHandler := handlers.NewConstructionHandler(ohgoClient)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "API is running"})
	})

	v1 := r.Group("/api/v1")
	{
		// Auth Middleware will go here eventually

		v1.GET("/construction" /* handlers.GetConstruction */)
		v1.GET("/construction/:region" /* handlers.GetConstructionByRegion */)

		v1.GET("/incidents" /* handlers.GetIncidents */)
		v1.GET("/slowdowns" /* handlers.GetSlowdowns */)

		v1.GET("/weather" /* handlers.GetWeatherSensors */)
	}

	return r
}
