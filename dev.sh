#!/bin/bash

echo "🚀 Starting URL Shortener in DEVELOPMENT mode..."
echo "🧹 Cleaning up any existing containers..."
docker compose down

echo "📦 Starting Docker containers with dev configuration..."
docker compose up "$@"

# The docker-compose.override.yml will be automatically used
# Frontend will be available at http://localhost:5173
# Backend will be available at http://localhost:3000/api
