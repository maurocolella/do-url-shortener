# Build stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including dev dependencies for building)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application with --skipLibCheck to avoid TypeScript errors
RUN pnpm run build -- --skipLibCheck

# Expose the port
EXPOSE 5173

# Start the Vite preview server with host flag to listen on all interfaces
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0"]
