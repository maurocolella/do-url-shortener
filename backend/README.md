# URL Shortener Backend

The backend component of the URL Shortener application, built with NestJS, TypeScript, PostgreSQL, and Redis.

## Architecture Overview

The backend follows a modular architecture based on NestJS's module system, with clear separation of concerns:

### Core Modules

1. **URL Module**
   - Handles the creation, retrieval, updating, and deletion of shortened URLs
   - Implements URL normalization and unique slug generation
   - Manages URL visit tracking and analytics

2. **User Module**
   - Manages user accounts and profiles
   - Handles password hashing and user data storage
   - Provides user-specific URL management

3. **Auth Module**
   - Implements authentication strategies (local and Google OAuth)
   - Manages JWT token generation and validation
   - Handles user registration and login flows

4. **Redis Module**
   - Provides caching for frequently accessed URLs
   - Implements rate limiting to prevent abuse
   - Offers a fast lookup service for URL resolution

### Database Schema

The application uses a PostgreSQL database with the following main entities:

1. **Users**
   - Stores user account information
   - Supports both local and OAuth authentication methods

2. **URLs**
   - Stores shortened URL information
   - Tracks visit counts and creation dates
   - Links URLs to user accounts

3. **Canonical URLs**
   - Stores normalized versions of original URLs
   - Prevents duplicate storage of the same destination URL

4. **Aliases**
   - Maps short slugs to canonical URLs
   - Supports user-specific URL mappings
   - Enables custom slug functionality

### Key Features

1. **URL Shortening Logic**
   - URLs are normalized to ensure consistent handling
   - For each user and canonical URL combination, only one shortened version is created
   - Custom slugs can be specified by authenticated users
   - Automatic slug generation uses Base62 encoding for compact representation

2. **Authentication System**
   - Secure password hashing using Node.js crypto module with scrypt
   - JWT-based authentication with configurable expiration
   - Support for Google OAuth integration
   - Role-based access control for administrative functions

3. **Performance Optimizations**
   - Redis caching for frequently accessed URLs
   - Database query optimization with proper indexing
   - Efficient URL normalization and hashing algorithms

4. **Security Features**
   - Rate limiting to prevent brute force attacks
   - Input validation and sanitization
   - CORS configuration for API security
   - Environment-based configuration management

## Technical Implementation

### URL Shortening Process

1. **URL Normalization**
   - Adds https:// if no scheme is provided
   - Converts scheme and host to lowercase
   - Sorts query parameters in a consistent order
   - Ensures trailing slashes are handled consistently

2. **Slug Generation**
   - For custom slugs: validates availability and format
   - For automatic slugs: generates a namespaced hash based on URL and user ID
   - Converts hash to Base62 for compact representation
   - Handles collision detection and resolution

3. **URL Resolution**
   - Attempts to resolve from Redis cache first
   - Falls back to database lookup if not in cache
   - Updates visit statistics asynchronously
   - Caches results for future requests

### Authentication Flow

1. **Registration**
   - Validates user input
   - Checks for existing accounts
   - Securely hashes passwords using crypto.scrypt
   - Creates user record and issues JWT token

2. **Login**
   - Validates credentials
   - Issues JWT token with configurable expiration
   - Supports remember-me functionality

3. **OAuth**
   - Integrates with Google OAuth
   - Creates or links user accounts
   - Issues JWT token upon successful authentication

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google OAuth callback

### URL Management

- `POST /api/urls` - Create a new shortened URL
- `GET /api/urls` - Get all URLs for the authenticated user
- `GET /api/urls/:id` - Get a specific URL by ID
- `PUT /api/urls/:id` - Update a URL
- `DELETE /api/urls/:id` - Delete a URL
- `GET /api/urls/stats` - Get URL statistics

### URL Redirection

- `GET /:slug` - Redirect to the original URL

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=url_shortener

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# URL Configuration
URL_DOMAIN=http://localhost:3000
URL_SLUG_LENGTH=6
```

### Running with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend

# Restart backend service
docker compose restart backend
```

### Running Locally

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm start:dev

# Run in production mode
pnpm build
pnpm start
```

### Database Migrations

```bash
# Generate a migration
pnpm migration:generate -- -n MigrationName

# Run migrations
pnpm migration:run

# Revert migration
pnpm migration:revert
```

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Code Structure

```
backend/
├── src/
│   ├── common/                 # Common utilities and guards
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth and rate limit guards
│   │   ├── interceptors/       # Request/response interceptors
│   │   └── utils/              # Utility functions
│   │       ├── base62.util.ts  # Base62 encoding for slugs
│   │       └── url-normalizer.util.ts # URL normalization
│   ├── config/                 # Configuration
│   │   └── configuration.ts    # Environment configuration
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── controllers/    # Auth controllers
│   │   │   ├── decorators/     # Auth decorators
│   │   │   ├── dto/            # Data transfer objects
│   │   │   ├── guards/         # Auth guards
│   │   │   ├── strategies/     # Passport strategies
│   │   │   └── auth.service.ts # Auth service
│   │   ├── redis/              # Redis module
│   │   │   └── redis.service.ts # Redis service
│   │   ├── url/                # URL module
│   │   │   ├── controllers/    # URL controllers
│   │   │   ├── dto/            # Data transfer objects
│   │   │   ├── entities/       # URL-related entities
│   │   │   └── url.service.ts  # URL service
│   │   └── user/               # User module
│   │       ├── dto/            # Data transfer objects
│   │       ├── entities/       # User entity
│   │       └── user.service.ts # User service
│   ├── app.module.ts           # Root application module
│   └── main.ts                 # Application entry point
├── test/                       # E2E tests
├── nest-cli.json               # NestJS CLI configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Design Decisions

### Why NestJS?

NestJS was chosen for its robust architecture based on Angular's design patterns, which promotes modularity, testability, and maintainability. Its built-in support for TypeScript, dependency injection, and various integrations (TypeORM, Passport, etc.) makes it ideal for building scalable backend applications.

### Database Schema Design

The database schema separates canonical URLs from aliases to:
1. Minimize storage requirements by avoiding duplicate storage of the same destination URL
2. Allow multiple users to create different aliases for the same canonical URL
3. Support efficient querying and indexing

### Authentication Strategy

The application uses JWT for authentication because:
1. It's stateless, reducing server-side storage requirements
2. It works well with the SPA frontend architecture
3. It's easily extendable to support additional authentication methods

### URL Shortening Algorithm

The URL shortening algorithm:
1. Uses a combination of the URL and user ID to generate a unique hash
2. Converts the hash to Base62 for human-readable, compact slugs
3. Includes collision detection and resolution
4. Ensures that the same URL shortened by the same user always produces the same result

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
