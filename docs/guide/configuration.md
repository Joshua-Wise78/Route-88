# Configuration & Environment

Route-88 uses environment variables managed by `dotenv` and validated with `zod` at startup.

## Environment Variables Reference

| Variable | Description | Default | Required? |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | - | **Yes** |
| `OHGO_API_KEY` | Ohio DOT OHGO API developer key | - | **Yes** |
| `INTERNAL_API_KEY` | Bearer token for authenticating protected routes | `my-super-secret-key-123` | Recommended in prod |
| `PORT` | API server port | `3333` | No |
| `DEFAULT_REGION` | Default OHGO region for scheduler & feeds | `sw-ohio` | No |
| `ENABLE_SCHEDULER` | Toggle background cron jobs | `true` | No |
| `OSRM_URL` | Endpoint for OSRM turn-by-turn routing | `http://osrm:5000` | No |
| `NOMINATIM_URL` | Endpoint for Nominatim geocoding & autocomplete | `http://nominatim:8080` | No |
| `DISCORD_INCIDENTS_WEBHOOK_URL` | Discord webhook for active crashes & incidents | - | Optional |
| `DISCORD_CONSTRUCTION_WEBHOOK_URL` | Discord webhook for road construction | - | Optional |
| `DISCORD_SLOWDOWNS_WEBHOOK_URL` | Discord webhook for dangerous slowdowns | - | Optional |
| `DISCORD_DAILY_WEBHOOK_URL` | Discord webhook for 8 AM daily digest | - | Optional |

## Custom Environment File

You can specify a custom env file path using `ENV_FILE`:
```bash
ENV_FILE=.env.production bun src/index.ts
```
