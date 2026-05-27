package handlers

import (
	"encoding/csv"
	"net/http"
	"route88/internal/db"

	"github.com/gin-gonic/gin"
)

func ExportIncidentsCSV(store *db.Store) gin.HandlerFunc {
	return func(c *gin.Context) {
		incidents, err := store.GetAllIncidents()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
			return
		}

		// Set headers to trigger a file download in the browser
		c.Header("Content-Disposition", `attachment; filename="route88_incidents.csv"`)
		c.Header("Content-Type", "text/csv")
		c.Header("Transfer-Encoding", "chunked")

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		// Write CSV Header
		if err := writer.Write([]string{"ID", "Location", "Description", "Category", "Direction", "RouteName", "RoadStatus"}); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		// Write Data Rows
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
