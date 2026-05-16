# Route-88

Ohio Traffic Monitoring

Self-hosted Ohio monitoring API and Discord alerting service.

## Features

- RESTful API built with GO and Gin for querying OHGO data.
- Background worker that pushes major traffic events to a specified Discord channel using webhooks.
- Built-in state management to prevent duplicate alerts.
- Lightweight deployment using Docker.

## Configuration

Before composing Route-88 a `.env` file in the root directory is needed.

``` env
OHGO_API_KEY=your_api_key
DISCORD_WEBHOOK_URL=your_webhook_url
APP_ENV=production
```

## Deployment

1.  Clone the repository to your server.
2.  Ensure the `.env` is created.
3.  Deploy the stack using `docker compose up -d --build`

## API Endpoints

The standalone API runs on port 8080 internally and provides these endpoints. Under `/api/v1/traffic`

- `/incidents` Current road closures and restrictions.
- `/delays` Travel delays with estimated wait times.
- `/construction` Active construction zones.
- `/cameras` OHGO traffic camera feeds.
- `/messagesigns` Digital highway sign messages.
- `/weather` Weather sensor station data

## License

This project is under the MIT License. Copyright (c) 2026 Joshua Wise
