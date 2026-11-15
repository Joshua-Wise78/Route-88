# Docker Services & Architecture

Route-88 orchestrates multi-container services with Docker Compose profiles, enabling modular and resource-conscious deployments.

## Available Profiles

- **Default (Core)**: Runs PostgreSQL 17 and the Route-88 API.
  ```bash
  docker compose up -d
  ```
- **Routing**: Runs Core plus local OSRM and Nominatim services.
  ```bash
  docker compose --profile routing up -d
  ```
- **Tools**: Includes Adminer database management UI.
  ```bash
  docker compose --profile tools up -d
  ```
- **All**: Runs the entire multi-container suite.
  ```bash
  docker compose --profile all up -d
  ```

## Automated Setup Helper

Route-88 includes an interactive onboarding script:
```bash
bun run setup
# Or directly:
bash scripts/setup-docker.sh
```
This script checks for `.env`, creates one from `.env.example`, verifies directories, and prompts for your desired profile.
