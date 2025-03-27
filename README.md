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

The easiest way to get started is to use the initialization script:

```bash
chmod +x init.sh
./init.sh
```

This will:
1. Build and start all containers
2. Provide URLs to access the application

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
│   │   ├── config/         # Configuration
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── redis/      # Redis module
│   │   │   ├── url/        # URL module
│   │   │   └── user/       # User module
│   │   └── main.ts         # Application entry point
│   └── test/               # Tests
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
