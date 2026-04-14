package services

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

type OHGOClient struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

func NewOHGOClient(apiKey string) *OHGOClient {
	return &OHGOClient{
		APIKey:  apiKey,
		BaseURL: "https://publicapi.ohgo.com/api/v1",
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *OHGOClient) get(endpoint string) ([]byte, error) {

	reqURL := fmt.Sprintf("%s%s", c.BaseURL, endpoint)

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return nil, err
	}

	// Auth header with API Key
	req.Header.Add("Authorization", c.APIKey)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	// Close connection
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OHGO API returned status: %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}
