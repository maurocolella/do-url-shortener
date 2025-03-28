# URL Shortener

A full-stack URL shortener application built with NestJS, React, TypeScript, and PostgreSQL.

## Quick Start

### Development Environment
```bash
chmod +x dev.sh
./dev.sh
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Production Environment
```bash
chmod +x prod.sh
./prod.sh
```
- Frontend: http://localhost:4173
- Backend API: http://localhost:3000/api

## Prerequisites
- Docker
- Node.js (v16 or higher)
- pnpm (preferred package manager)

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
- **NestJS** with TypeScript
- **PostgreSQL** with **TypeORM**
- **Redis** for caching and rate limiting
- **JWT** for authentication
- **Passport.js** for OAuth strategies
- **Base62** encoding for generating short slugs

### Frontend
- **React** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Toastify** for notifications
- **Cypress** for testing

### Infrastructure
- **Docker** and Docker Compose for containerization

## Manual Setup

### Installation

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

### Development Setup

#### Backend
```bash
cd backend
pnpm install
pnpm start:dev
```

#### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Running Tests

#### Backend
```bash
cd backend
pnpm test
pnpm test:e2e
```

#### Frontend
```bash
cd frontend
pnpm cypress:open  # Interactive test runner
pnpm cypress:run   # Headless test runner
pnpm test          # Run all tests
```

## Database Management

The application uses TypeORM migrations to set up and maintain the database schema. For convenience, migrations run automatically when the application starts if the database is empty, ensuring you can get started quickly without manual setup.

```bash
# Run migrations
pnpm migration:run

# Revert the last migration
pnpm migration:revert

# Generate a new migration
pnpm migration:generate -- -n MigrationName
```

## Setting Up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth client ID for a web application
5. Add authorized origins (e.g., `http://localhost:5173`)
6. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/google/callback`)
7. Copy Client ID and Secret to your backend `.env` file

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

The application includes robust URL normalization to ensure consistency when handling URLs. This prevents duplicate entries for URLs that are semantically identical but syntactically different. Normalization handles the following edge cases:

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

## API Documentation

API documentation is available at http://localhost:3000/api/docs when the backend is running.

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
