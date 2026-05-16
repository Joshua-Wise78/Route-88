package discord

import (
	"fmt"
	"route88/internal/ohgo"
)

func FormatIncident(incident ohgo.Incident) Embed {
	color := 16753920 // Orange default for Restricted
	if incident.RoadStatus == "CLOSED" {
		color = 16711680 // Red for closed roads
	}

	return Embed{
		Title:       fmt.Sprintf("Traffic Incident: %s", incident.RouteName),
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
}

func FormatDelay(delay ohgo.TravelDelay) Embed {
	return Embed{
		Title:       fmt.Sprintf("Traffic Delay: %s", delay.RouteName),
		Description: delay.Description,
		Color:       16766720, // Yellow
		Fields: []Field{
			{Name: "Location", Value: delay.Location, Inline: true},
			{Name: "Direction", Value: delay.Direction, Inline: true},
			{Name: "Current Speed", Value: fmt.Sprintf("%.0f mph", delay.CurrentAvgSpeed), Inline: true},
			{Name: "Delay Time", Value: fmt.Sprintf("%.0f mins", delay.DelayTime), Inline: true},
		},
		Footer: &Footer{Text: "Route-88 Auto-Alert"},
	}
}

func FormatConstruction(construction ohgo.Construction) Embed {
	return Embed{
		Title:       "Construction Alert",
		Description: construction.Description,
		Color:       3447003, // Blue
		Fields: []Field{
			{Name: "Location", Value: construction.Location, Inline: true},
			{Name: "County", Value: construction.County, Inline: true},
			{Name: "Duration", Value: fmt.Sprintf("%s to %s", construction.StartDate, construction.EndDate), Inline: false},
		},
		Footer: &Footer{Text: "Route-88 Auto-Alert"},
	}
}
