#!/bin/sh
set -e

# Cacheia config, rotas e views com as variáveis de ambiente reais do container
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
