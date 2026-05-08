package ohgo

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

const (
	baseURL = "https://publicapi.ohgo.com/api/v1"
)

type Client struct {
	APIKey     string
	HTTPClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		APIKey: apiKey,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Client) doGet(endpoint string, query url.Values, dest any) error {
	reqURL := fmt.Sprintf("%s/%s", baseURL, endpoint)
	if len(query) > 0 {
		reqURL = fmt.Sprintf("%s?%s", reqURL, query.Encode())
	}

	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("APIKEY %s", c.APIKey))

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("OHGO API returned status: %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(dest)
}

func (c *Client) GetIncidents(query url.Values) ([]Incident, error) {
	var result APIResult[Incident]
	if err := c.doGet("incidents", query, &result); err != nil {
		return nil, err
	}
	return result.Results, nil
}

func (c *Client) GetTravelDelays(query url.Values) ([]TravelDelay, error) {
	var result APIResult[TravelDelay]
	if err := c.doGet("traveldelays", query, &result); err != nil {
		return nil, err
	}
	return result.Results, nil
}

func (c *Client) GetConstruction(query url.Values) ([]Construction, error) {
	var result APIResult[Construction]
	if err := c.doGet("construction", query, &result); err != nil {
		return nil, err
	}
	return result.Results, nil
}
