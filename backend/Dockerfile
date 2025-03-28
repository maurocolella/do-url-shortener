# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy pnpm lock file and package.json
COPY pnpm-lock.yaml package.json ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy pnpm lock file and package.json
COPY pnpm-lock.yaml package.json ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 3000

# Start the application (migrations will run automatically on startup)
CMD ["pnpm", "start"]
