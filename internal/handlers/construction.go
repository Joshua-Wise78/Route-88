package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"route88/internal/services"
)

type ConstructionHandler struct {
	ohgoClient *services.OHGOClient
}

func NewConstructionHandler(client *services.OHGOClient) *ConstructionHandler {
	return &ConstructionHandler{
		ohgoClient: client,
	}
}

func (h *ConstructionHandler) GetAll(c *gin.Context) {

	// TODO: FetchConstruction()
	// Function call will go here eventually for construction data
	// it will also handle the errors

	c.JSON(http.StatusOK, gin.H{
		"endpoint": "GetAllConstruction",
		"status": "Success",
		"message": "This will eventually return all active ohio construction zones",
	})
}

func (h *ConstructionHandler) GetByRegion(c *gin.Context) {

	region := c.Param("region")

	// TODO: h.ohgoClient.FetchConstrucitionByRegion(region)

	c.JSON(http.StatusOK, gin.H{
		"endpoint": "GetConstructionByRegion",
		"region": region,
		"message": "This will return construction data for a specific region of Ohio."
	})
}
