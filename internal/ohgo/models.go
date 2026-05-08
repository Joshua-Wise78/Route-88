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

type Camera struct {
	ID          string `json:"id"`
	Location    string `json:"location"`
	Description string `json:"description"`
	Direction   string `json:"direction"`
	County      string `json:"county"`
	CameraViews []struct {
		URL string `json:"url"`
	} `json:"cameraViews"`
}

type MessageSign struct {
	ID        string `json:"id"`
	Location  string `json:"location"`
	Direction string `json:"direction"`
	Message   string `json:"message"`
	County    string `json:"county"`
}

type WeatherSensor struct {
	ID            string  `json:"id"`
	Location      string  `json:"location"`
	County        string  `json:"county"`
	Precipitation string  `json:"precipitation,omitempty"`
	SurfaceTemp   float64 `json:"surfaceTemp,omitempty"`
	AirTemp       float64 `json:"airTemp,omitempty"`
}

type ErrorResult struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
}
