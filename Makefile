.PHONY: install build start dev test test-watch format lint check clean docker-up docker-down frontend-install frontend-dev frontend-build help

# Colors for terminal output
GREEN := \033[0;32m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install backend dependencies
	@echo "Installing backend dependencies..."
	npm install

build: ## Build the TypeScript project
	@echo "Building backend..."
	npm run build

start: ## Start the application
	@echo "Starting application..."
	npm start

dev: ## Run the application in development mode
	@echo "Starting development server..."
	npm run dev

test: ## Run tests
	@echo "Running tests..."
	npm test

test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	npm run test:watch

format: ## Format code using Biome
	@echo "Formatting code..."
	npm run format
	cd frontend && npm run format

lint: ## Run Biome linter
	@echo "Linting code..."
	npm run lint
	cd frontend && npm run lint

check: ## Run Biome checks and apply fixes
	@echo "Running Biome checks..."
	npm run check

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules
	rm -rf frontend/dist
	rm -rf frontend/node_modules

docker-up: ## Start Docker containers
	@echo "Starting Docker containers..."
	docker-compose up -d

docker-down: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	docker-compose down

setup: install frontend-install docker-up ## Complete setup: install all dependencies and start Docker
	@echo "Setup complete!"

dev-env: setup build ## Set up development environment
	@echo "Development environment ready!"

dev-all: dev-env ## Start both frontend and backend in development mode
	@echo "Starting all development servers..."
	make -j2 dev frontend-dev
