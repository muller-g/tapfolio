# =============================================================================
# TapFolio — Makefile
# Atalhos para comandos comuns de desenvolvimento
# =============================================================================

.PHONY: help up down build dev logs shell-backend shell-frontend migrate seed test lint

## Exibe esta ajuda
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# -----------------------------------------------------------------------------
# Docker
# -----------------------------------------------------------------------------

## Sobe todos os serviços em produção
up:
	docker compose up -d

## Sobe todos os serviços em modo desenvolvimento (com hot reload)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

## Para todos os serviços
down:
	docker compose down

## Para todos os serviços e remove volumes (⚠️ apaga dados)
down-clean:
	docker compose down -v

## Rebuilda as imagens
build:
	docker compose build --no-cache

## Exibe logs em tempo real
logs:
	docker compose logs -f

## Logs apenas do backend
logs-backend:
	docker compose logs -f backend

## Logs apenas do frontend
logs-frontend:
	docker compose logs -f frontend

# -----------------------------------------------------------------------------
# Backend (Laravel)
# -----------------------------------------------------------------------------

## Abre shell no container do backend
shell-backend:
	docker compose exec backend sh

## Executa as migrations
migrate:
	docker compose exec backend php artisan migrate

## Executa migrations + seeders
migrate-fresh:
	docker compose exec backend php artisan migrate:fresh --seed

## Executa os seeders
seed:
	docker compose exec backend php artisan db:seed

## Executa os testes do backend
test-backend:
	docker compose exec backend php artisan test

## Executa lint no backend (PHP CS Fixer)
lint-backend:
	docker compose exec backend ./vendor/bin/pint

## Gera a APP_KEY do Laravel
key-generate:
	docker compose exec backend php artisan key:generate

## Limpa todos os caches do Laravel
cache-clear:
	docker compose exec backend php artisan optimize:clear

# -----------------------------------------------------------------------------
# Frontend (Next.js)
# -----------------------------------------------------------------------------

## Abre shell no container do frontend
shell-frontend:
	docker compose exec frontend sh

## Executa os testes do frontend
test-frontend:
	docker compose exec frontend npm test

## Executa lint no frontend
lint-frontend:
	docker compose exec frontend npm run lint

## Executa type check no frontend
typecheck:
	docker compose exec frontend npm run typecheck

# -----------------------------------------------------------------------------
# Setup inicial
# -----------------------------------------------------------------------------

## Configura o projeto do zero (primeira execução)
setup:
	@echo "Configurando TapFolio..."
	@cp -n .env.example .env || true
	@echo "Arquivo .env criado. Edite as variáveis antes de continuar."
	@$(MAKE) build
	@$(MAKE) up
	@$(MAKE) key-generate
	@$(MAKE) migrate-fresh
	@echo "✅ TapFolio configurado com sucesso!"
	@echo "   Backend: http://localhost:8000"
	@echo "   Frontend: http://localhost:3000"
	@echo "   MinIO Console: http://localhost:9001"
	@echo "   Mailpit: http://localhost:8025"
