package discord

import (
	"fmt"

	"route88/internal/ohgo"
)

func FormatIncident(incident ohgo.Incident) Embed {
	color := 16753920 // Orange default
	if incident.RoadStatus == "CLOSED" {
		color = 16711680 // Red for closed roads
	}

	embed := Embed{
		Title:       fmt.Sprintf("Traffic Alert: %s", incident.RouteName),
		Description: incident.Description,
		Color:       color,
		Fields: []Field{
			{Name: "Location", Value: incident.Location, Inline: true},
			{Name: "Direction", Value: incident.Direction, Inline: true},
			{Name: "Category", Value: incident.Category, Inline: true},
			{Name: "Status", Value: incident.RoadStatus, Inline: true},
		},
		Footer: &Footer{Text: "Route-88 Auto-Alert"},
	}

	return embed
}
