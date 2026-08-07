# Route 88

Route 88 is a backend service designed to fetch, process, and distribute traffic, construction, incident, slowdown, and WZDx (Work Zone Data Exchange) feed data. Built with a focus on performance and type safety, it provides APIs for interacting with traffic data and integrating with external platforms.

## Technology Stack
- Runtime: Bun
- Framework: Hono
- Database ORM: Drizzle ORM
- Database: PostgreSQL
- Type Validation: Zod

## Getting Started

### Prerequisites
- Bun installed on your system
- A running instance of PostgreSQL

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies:
```bash
bun install
```
3. Set up your environment variables in a `.env` file (ensure you provide database credentials and other required variables like `DISCORD_WEBHOOK_URL`).

### Database Setup
Run the following commands to set up your database schema:
```bash
bun run db:generate
bun run db:push
```

### Running the Application
To run the server in development mode with hot-reloading:
```bash
bun run dev
```

To run the server in production mode:
```bash
bun start
```

## Roadmap

The following outlines the planned features and extensions for the Route 88 platform.

### Map API Integration
- Implement a geospatial backend to store and query location data efficiently.
- Integrate a mapping provider (e.g., Mapbox, Google Maps, or Leaflet) for rendering dynamic maps.
- Provide GeoJSON endpoints that plot active incidents, construction zones, and traffic slowdowns on the map.
- Support real-time routing to calculate alternate paths avoiding known incidents.
- Implement clustering algorithms to handle high densities of traffic events on the map without performance degradation.

### Frontend Features
- Develop an interactive dashboard to monitor real-time traffic updates.
- Build filtering and search capabilities to let users find specific events by region, road name, or event type.
- Implement user authentication and personalized user settings to save frequently traveled routes.
- Create push notifications (using WebSockets or Server-Sent Events) for immediate alerts on critical traffic updates.
- Design a responsive interface optimized for both desktop and mobile web experiences.

### Discord Bot Integration
- Upgrade the current webhook implementation to a fully interactive Discord Bot application.
- Implement slash commands (e.g., `/traffic [route]`, `/incidents [city]`) to query the backend directly from Discord.
- Set up automated subscription channels where the bot posts recurring alerts for specific highways or regions.
- Provide interactive buttons or dropdowns on bot messages to let users get more details about a specific traffic event.
- Introduce role-based access control for managing which Discord users can configure alert thresholds and routes.
