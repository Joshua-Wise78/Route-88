#!/usr/bin/env bash
set -e

echo "=================================================="
echo "         Route-88 Container & Env Setup           "
echo "=================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 1. Check or generate .env file
if [ ! -f .env ]; then
    echo "No .env file found. Creating .env from .env.example..."
    cp .env.example .env
    echo ".env created successfully."
    echo ""
    read -rp "Do you have an OHGO API Key ready? [y/N]: " has_key
    if [[ "$has_key" =~ ^[Yy]$ ]]; then
        read -rp "Enter your OHGO API Key: " ohgo_key
        if [ -n "$ohgo_key" ]; then
            sed -i "s|OHGO_API_KEY=.*|OHGO_API_KEY=${ohgo_key}|" .env
            echo "OHGO_API_KEY saved to .env."
        fi
    fi
else
    echo "Found existing .env file."
fi

# 2. Ensure data directories exist
mkdir -p osrm-data

# 3. Choose startup profile
echo ""
echo "Select Docker Compose profile to launch:"
echo "  1) Core (API + PostgreSQL) [Recommended for quick start]"
echo "  2) Full (API + PostgreSQL + Adminer + OSRM + Nominatim)"
echo "  3) Routing (API + PostgreSQL + OSRM + Nominatim)"
echo "  4) Skip starting containers now"
read -rp "Selection [1-4] (default 1): " profile_choice
profile_choice="${profile_choice:-1}"

case "$profile_choice" in
    1)
        echo "Starting Core services (PostgreSQL + API)..."
        docker compose up -d
        ;;
    2)
        echo "Starting Full suite with all profiles..."
        docker compose --profile all up -d
        ;;
    3)
        echo "Starting Core + Routing services..."
        docker compose --profile routing up -d
        ;;
    4)
        echo "Setup complete. Start containers whenever you are ready using:"
        echo "  docker compose up -d"
        exit 0
        ;;
    *)
        echo "Invalid selection. Starting Core services..."
        docker compose up -d
        ;;
esac

echo ""
echo "Containers started! Check logs with: docker compose logs -f api"
echo "=================================================="
