# Project task runner. Run `make` or `make help` to list targets.
#
# Two ways to run things:
#   make dev / dev-fe / dev-be   -> hot-reloading dev containers (source bind-mounted)
#   make up                      -> production images, as deployed
#
# Dependencies are installed in two places on purpose:
#   - inside the containers, automatically at startup (what actually runs)
#   - on your machine via `make install` (so your editor, lint and tsc see them)
# The dev targets run `install` first so both stay in sync.

COMPOSE      := docker compose
COMPOSE_DEV  := docker compose -f docker-compose.dev.yml

.DEFAULT_GOAL := help
.PHONY: help install install-fe install-be sync sync-fe sync-be dev dev-fe dev-be db up up-fe up-be build down clean logs ps lint typecheck

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## ---- Dependencies -------------------------------------------------------

install: ## npm install at root (installs client/ and server/ too via postinstall)
	npm install

install-fe: ## npm install in client/
	cd client && npm install

install-be: ## npm install in server/
	cd server && npm install

sync: sync-fe sync-be ## After adding a library on your machine: pick it up in the running dev containers

sync-fe: ## Restart the dev client container (re-runs npm install on startup)
	$(COMPOSE_DEV) restart client

sync-be: ## Restart the dev server container (re-runs npm install on startup)
	$(COMPOSE_DEV) restart server

## ---- Development (hot reload) -------------------------------------------

dev: install ## Run client + server + db with hot reload
	$(COMPOSE_DEV) up

dev-fe: install-fe ## Run client only (Vite on :5173)
	$(COMPOSE_DEV) up --no-deps client

dev-be: install-be ## Run server + db (API on :3000)
	$(COMPOSE_DEV) up db server

db: ## Run postgres only (:5432)
	$(COMPOSE) up db

## ---- Production images --------------------------------------------------

up: ## Build and run production images (client :8080, server :3000)
	$(COMPOSE) up --build -d
	$(COMPOSE) ps

up-fe: ## Run production client only
	$(COMPOSE) up --build -d --no-deps client

up-be: ## Run production server + db
	$(COMPOSE) up --build -d db server

build: ## Build production images without running them
	$(COMPOSE) build

## ---- Lifecycle ----------------------------------------------------------

down: ## Stop all containers (keeps database data)
	$(COMPOSE_DEV) down --remove-orphans

clean: down ## Stop containers and delete database data and dev node_modules volumes
	$(COMPOSE_DEV) down -v --remove-orphans

logs: ## Follow logs of running containers
	$(COMPOSE_DEV) logs -f

ps: ## Show container status
	$(COMPOSE_DEV) ps

## ---- Quality ------------------------------------------------------------

lint: ## Lint client and server
	cd client && npm run lint
	cd server && npm run lint

format: ## Format everything with prettier
	npm run format
	cd client && npm run format
	cd server && npm run format

format-check: ## Check formatting without writing
	npm run format:check
	cd client && npm run format:check
	cd server && npm run format:check

typecheck: ## Type-check client and server
	cd client && npx tsc -b
	cd server && npm run typecheck

test: ## Run client and server tests
	cd client && npm test
	cd server && npm test
