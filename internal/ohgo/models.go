package ohgo

type APIResult[T any] struct {
	Results []T `json:"results"`
	Total   int `json:"total,omitempty"`
}

type Incident struct {
	ID                 string              `json:"id"`
	Location           string              `json:"location"`
	Description        string              `json:"description"`
	Category           string              `json:"category"`
	Direction          string              `json:"direction"`
	RouteName          string              `json:"routeName"`
	RoadStatus         string              `json:"roadStatus"`
	RoadClosureDetails *RoadClosureDetails `json:"roadClosureDetails,omitempty"`
}

type RoadClosureDetails struct {
	Type        string `json:"type,omitempty"`
	Description string `json:"description,omitempty"`
	// Will be expanded later
}

type TravelDelay struct {
	ID            string  `json:"id"`
	Route         string  `json:"route"`
	Direction     string  `json:"direction"`
	StartLocation string  `json:"startLocation"`
	EndLocation   string  `json:"endLocation"`
	DelayMinutes  float64 `json:"delayMinutes"`
	Speed         float64 `json:"speed"`
}

type Construction struct {
	ID          string `json:"id"`
	Location    string `json:"location"`
	Description string `json:"description"`
	County      string `json:"county"`
	Direction   string `json:"direction"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	IsActive    bool   `json:"isActive"`
}

type ErrorResult struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
}
