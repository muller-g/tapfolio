# =============================================================================
# TapFolio — Backend (Laravel 11)
# Multi-stage build: desenvolvimento e produção
# =============================================================================

# -----------------------------------------------------------------------------
# Stage base: dependências do sistema
# -----------------------------------------------------------------------------
FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    curl \
    libpq-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        gd \
        opcache \
        pcntl \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# -----------------------------------------------------------------------------
# Stage development
# -----------------------------------------------------------------------------
FROM base AS development

COPY php/php-dev.ini /usr/local/etc/php/conf.d/app.ini

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# -----------------------------------------------------------------------------
# Stage production build: instala dependências
# -----------------------------------------------------------------------------
FROM base AS builder

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# -----------------------------------------------------------------------------
# Stage production: imagem final mínima
# -----------------------------------------------------------------------------
FROM php:8.3-fpm-alpine AS production

RUN apk add --no-cache \
    curl \
    libpq \
    libpng \
    libjpeg-turbo \
    libwebp \
    && docker-php-ext-install pdo pdo_pgsql gd opcache pcntl \
    && addgroup -g 1000 -S www \
    && adduser -u 1000 -S www -G www

COPY php/php-prod.ini /usr/local/etc/php/conf.d/app.ini
COPY --from=builder --chown=www:www /var/www/html /var/www/html

WORKDIR /var/www/html
USER www

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
