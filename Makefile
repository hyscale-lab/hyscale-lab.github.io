# Local development helpers. Run `make` or `make help` for the list.
#
#   make install   install dependencies
#   make start     start the dev server in the background (http://localhost:4321)
#   make stop      stop it
#
# The dev server reloads when files in content/ or src/ change.

PORT ?= 4321
ASTRO := ./node_modules/.bin/astro

.DEFAULT_GOAL := help
.PHONY: help install start stop restart status logs build preview check format

help: ## Show this help
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  make %-9s %s\n", $$1, $$2}'

install: ## Install dependencies from package-lock.json
	@command -v npm >/dev/null || { echo "npm not found: install Node.js 22.12+ first"; exit 1; }
	npm ci

start: ## Start the dev server in the background
	@test -x $(ASTRO) || $(MAKE) install
	@$(ASTRO) dev --background --port $(PORT)

stop: ## Stop the dev server
	@$(ASTRO) dev stop

restart: stop start ## Restart the dev server

status: ## Show whether the dev server is running
	@$(ASTRO) dev status

logs: ## Follow the dev server log
	@$(ASTRO) dev logs --follow

build: ## Production build into dist/
	npm run build

preview: build ## Build, then serve dist/ in the foreground
	$(ASTRO) preview --port $(PORT)

check: ## Type check and Prettier check
	npm run check
	npm run lint:prettier

format: ## Format with Prettier
	npm run format
