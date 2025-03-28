#!/bin/bash

echo "🚀 Starting URL Shortener in PRODUCTION mode..."
echo "🧹 Cleaning up any existing containers..."
docker compose down

echo "📦 Building and starting Docker containers with production configuration..."
docker compose -f docker-compose.yml up --build "$@"

# Only the base docker-compose.yml will be used (no override)
# Frontend will be available at http://localhost:4173
# Backend will be available at http://localhost:3000/api
