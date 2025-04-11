# Webz Data Fetcher

A TypeScript service that fetches data from the Webz.io API and stores it in PostgreSQL.

## Features

- Fetches data from Webz.io API with configurable queries
- Stores data in PostgreSQL database
- Implements Builder pattern for flexible query construction
- Includes unit tests with Jest
- Uses Docker Compose for easy database setup
- Implements proper logging with Winston
- Uses Swagger for API documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration (example provided in repository)

3. Start PostgreSQL using Docker Compose:
```bash
docker-compose up -d
```

4. Build the TypeScript code:
```bash
npm run build
```

## Running the Application

```bash
npm start
```

## Running Tests

```bash
npm test
```

## Development

```bash
npm run dev
```

## Project Structure

- `src/config/` - Configuration management
- `src/models/` - Database models
- `src/services/` - Core business logic
- `src/utils/` - Utility functions
- `src/__tests__/` - Test files

## Environment Variables

- `WEBZ_API_TOKEN` - Your Webz.io API token
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - PostgreSQL database name
- `POSTGRES_HOST` - PostgreSQL host
- `POSTGRES_PORT` - PostgreSQL port
