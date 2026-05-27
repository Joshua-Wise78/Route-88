package db

import (
	"database/sql"
	"route88/internal/ohgo"

	_ "github.com/lib/pq"
)

type Store struct {
	db *sql.DB
}

func NewStore(connStr string) (*Store, error) {
	db, err := sql.Open("postgres", connStr)

	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}
	return &Store{db: db}, nil
}

func (s *Store) InsertIncident(inc ohgo.Incident) error {
	query := `INSERT INTO incidents (id, location, description, category, direction, route_name, road_status) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`
	_, err := s.db.Exec(query, inc.ID, inc.Location, inc.Description, inc.Category, inc.Direction, inc.RouteName, inc.RoadStatus)
	return err
}

func (s *Store) GetAllIncidents() ([]ohgo.Incident, error) {
	rows, err := s.db.Query(`SELECT id, location, description, category, direction, route_name, road_status FROM incidents`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var incidents []ohgo.Incident
	for rows.Next() {
		var inc ohgo.Incident
		if err := rows.Scan(&inc.ID, &inc.Location, &inc.Description, &inc.Category, &inc.Direction, &inc.RouteName, &inc.RoadStatus); err != nil {
			return nil, err
		}
		incidents = append(incidents, inc)
	}
	return incidents, nil
}
