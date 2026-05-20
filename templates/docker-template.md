# Docker Template — [Nome do Projeto]

Templates de configuração Docker para diferentes stacks.

---

## Dockerfile — Node.js/NestJS (Produção)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Produção
FROM node:20-alpine AS runner
WORKDIR /app

# Usuário não-root (segurança)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## Dockerfile — Laravel/PHP

```dockerfile
FROM php:8.2-fpm-alpine AS base

# Extensões necessárias
RUN apk add --no-cache nginx supervisor libpng-dev libzip-dev zip unzip curl
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Dependências (aproveitando cache Docker)
COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader --no-dev --no-interaction

# Código
COPY . .

# Permissões
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Otimizações
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

EXPOSE 9000
CMD ["php-fpm"]
```

---

## docker-compose.yml — Desenvolvimento

```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    env_file: .env
    environment:
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - app-network

volumes:
  db-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

---

## .dockerignore

```
node_modules
.git
.env
.env.*
!.env.example
dist
build
.next
coverage
*.log
.DS_Store
README.md
CHANGELOG.md
docs/
```

---

## Comandos Úteis

```bash
# Subir ambiente
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Executar comando no container
docker-compose exec app npm run migrate
docker-compose exec app php artisan migrate

# Rebuild após mudança no Dockerfile
docker-compose up -d --build

# Parar e remover containers (mantém volumes)
docker-compose down

# Parar e remover tudo (inclui volumes)
docker-compose down -v
```

---

*Template: my-fullstack-developer*
