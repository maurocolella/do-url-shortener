# URL Shortener

A full-stack URL shortener application built with NestJS, React, TypeScript, and PostgreSQL.

## Features

- Shorten long URLs to easy-to-share links
- Custom slug support
- User authentication (local and Google OAuth)
- Dashboard to manage and track your shortened URLs
- URL visit analytics
- Rate limiting to prevent abuse
- Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- NestJS with TypeScript
- PostgreSQL with TypeORM
- Redis for caching and rate limiting
- JWT for authentication
- Passport.js for OAuth strategies
- Base62 encoding for generating short slugs

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- React Toastify for notifications
- Cypress for testing

### Infrastructure
- Docker and Docker Compose for containerization

## Getting Started

### Prerequisites
- Docker
- Node.js (v16 or higher)
- pnpm (preferred package manager)

### Quick Start

#### Database Setup

The application uses TypeORM migrations to set up and maintain the database schema. For demonstration purposes, migrations run automatically when the application starts if the database is empty. This ensures reviewers can easily set up and run the application without manual steps.

If you need to manually manage migrations, the backend provides the following npm scripts:

```bash
# Run migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate a new migration (after entity changes)
npm run migration:generate -- src/migrations/MigrationName

# Create an empty migration
npm run migration:create -- src/migrations/MigrationName
```

#### Development Environment

The easiest way to start the application in development mode is to use the development script:

```bash
chmod +x dev.sh
./dev.sh
```

This will:
1. Build and start all containers in development mode
2. Mount your local code directories as volumes for hot-reloading
3. Start the frontend with Vite's development server
4. Start the backend with nodemon for automatic restarts
5. Run database migrations automatically if needed

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

#### Production Environment

To run the application in production mode, use the production script:

```bash
chmod +x prod.sh
./prod.sh
```

This will:
1. Build optimized production containers
2. Start the application with production settings
3. Run the frontend using Vite's preview server
4. Run database migrations automatically if needed

The application will be available at:
- Frontend: http://localhost:4173
- Backend API: http://localhost:3000/api

### Docker Configuration

The project uses Docker Compose with override files to manage different environments:

- `docker-compose.yml`: Base configuration for production
- `docker-compose.override.yml`: Development overrides (automatically used with `docker compose up`)

#### Dockerfile Variants

Each service has two Dockerfile variants:

**Frontend:**
- `Dockerfile`: Production build that creates an optimized build and serves it with Vite's preview server
- `Dockerfile.dev`: Development setup with hot-reloading

**Backend:**
- `Dockerfile`: Production build with optimized dependencies
- `Dockerfile.dev`: Development setup with nodemon for automatic restarts

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both the backend and frontend directories
   - Update the values as needed

3. Start the application using Docker Compose:
```bash
docker compose up -d
```

4. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Setting Up Google OAuth

To enable Google OAuth authentication:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add the following URLs to "Authorized JavaScript origins":
   - `http://localhost:5173` (for development)
   - Your production URL (if applicable)
8. Add the following URLs to "Authorized redirect URIs":
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - Your production callback URL (if applicable)
9. Click "Create" to generate your Client ID and Client Secret
10. Copy these values to your backend `.env` file:
    ```
    GOOGLE_CLIENT_ID=your_client_id
    GOOGLE_CLIENT_SECRET=your_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
    ```

### Development Setup

#### Backend
```bash
cd backend
pnpm install
pnpm run start:dev
```

#### Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

### Running Tests

#### Backend
```bash
cd backend
pnpm run test
pnpm run test:e2e
```

#### Frontend
```bash
cd frontend
pnpm run cypress:open  # Interactive test runner
pnpm run cypress:run   # Headless test runner
pnpm run test          # Run all tests
```

## API Documentation

The API documentation is available at http://localhost:3000/api/docs when the backend is running.

## Project Structure

```
url-shortener/
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── common/         # Common utilities and guards
│   │   │   ├── decorators/ # Custom decorators
│   │   │   └── guards/     # Authentication and rate limiting guards
│   │   ├── config/         # Configuration
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── redis/      # Redis module
│   │   │   ├── redirect/   # URL redirection module
│   │   │   ├── url/        # URL management module
│   │   │   └── user/       # User management module
│   │   ├── app.module.ts   # Main application module
│   │   └── main.ts         # Application entry point
│   ├── test/               # Test files
│   ├── .env                # Environment variables
│   ├── .env.example        # Example environment variables
│   ├── nest-cli.json       # NestJS CLI configuration
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript configuration
├── frontend/               # React frontend
│   ├── cypress/            # Cypress tests
│   ├── public/             # Static assets
│   └── src/
│       ├── api/            # API client
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── store/          # Redux store
│       └── main.tsx        # Application entry point
└── docker-compose.yml      # Docker Compose configuration
```

## URL Normalization

The application includes robust URL normalization to ensure consistency when handling URLs. This prevents duplicate entries for URLs that are semantically identical but syntactically different. Our normalization handles the following edge cases:

### Protocol Handling
- Adding `https://` protocol if missing
- Converting scheme to lowercase

### Path Handling
- Converting path to lowercase for case insensitivity
- Preserving trailing slash for root paths (e.g., `https://example.com/`)
- Removing trailing slash from non-root paths (e.g., `https://example.com/path` instead of `https://example.com/path/`)
- Handling multiple trailing slashes (e.g., `https://example.com/path///` → `https://example.com/path`)
- Handling multiple leading slashes (e.g., `https://example.com//path` → `https://example.com/path`)

### Query Parameter Handling
- Sorting query parameters alphabetically for consistency
- Preserving query parameter case
- Handling multiple values for the same parameter
- Removing empty query parameter markers (e.g., `https://example.com/?` → `https://example.com/`)
- Preserving query parameters with empty values (e.g., `https://example.com/?param=`)
- Skipping empty parameter names (e.g., `https://example.com/?=value` → `https://example.com/`)

### Fragment (Hash) Handling
- Preserving fragments in URLs
- Maintaining fragments with query parameters
- Correctly handling fragments with empty queries

### Special Character Handling
- Properly encoding international characters in paths
- Preserving encoded characters
- Maintaining port numbers in URLs
- Preserving username and password components in URLs

### Error Handling
- Graceful handling of invalid URLs
- Proper handling of null or undefined inputs

This comprehensive approach ensures that URLs like `https://www.google.com/?` and `https://www.google.com/` are normalized to the same URL, preventing duplicate entries and improving the user experience.

## Rate Limiting

The application implements robust rate limiting to prevent abuse and ensure fair usage of the service. Rate limiting is applied to various endpoints based on their sensitivity and potential for abuse.

### Implementation Details

- **Redis-Based Storage**: Rate limiting leverages Redis for tracking request counts.
- **Per-Endpoint Customization**: Each endpoint has custom rate limits based on its usage pattern and sensitivity.
- **User vs. IP-Based Limits**: 
  - Authenticated users are rate limited based on their user ID
  - Unauthenticated requests are limited based on IP address

### Rate Limited Endpoints

- **Authentication**:
  - Login: 5 requests per minute
  - Registration: 5 requests per minute
  - Google OAuth: 10 requests per minute

- **URL Operations**:
  - URL Creation: 10 requests per minute
  - URL Updates: 15 requests per minute
  - URL Deletion: 10 requests per minute

- **Redirects**:
  - URL Redirects: 30 requests per minute per IP

### Rate Limit Headers

When a request is rate-limited, the following headers are included in the response:

- `X-RateLimit-Limit`: The maximum number of requests allowed in the current time window
- `X-RateLimit-Remaining`: The number of requests remaining in the current time window
- `X-RateLimit-Reset`: The time in seconds until the rate limit window resets
- `Retry-After`: The time in seconds to wait before making another request (only present when rate limit is exceeded)

### Configuration

Rate limiting can be configured through environment variables:

```
RATE_LIMIT_TTL=60  # Time-to-live in seconds for rate limiting window
RATE_LIMIT_MAX=10  # Maximum number of requests allowed in the window
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [NestJS](https://nestjs.com/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TypeORM](https://typeorm.io/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)
