#!/bin/bash

# =============================================================================
# setup.sh — Script de configuração inicial do projeto
# =============================================================================
# Uso: ./scripts/setup.sh [--stack <laravel|nestjs|nextjs>]
# Descrição: Configura o ambiente de desenvolvimento para o projeto
# =============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de output
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
header() { echo -e "\n${BLUE}═══════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}═══════════════════════════════${NC}\n"; }

# =============================================================================
# VERIFICAÇÕES DE PRÉ-REQUISITOS
# =============================================================================

header "Verificando pré-requisitos"

check_command() {
    local cmd=$1
    local install_hint=$2
    if command -v "$cmd" &> /dev/null; then
        success "$cmd encontrado: $(command -v "$cmd")"
        return 0
    else
        error "$cmd não encontrado. $install_hint"
        return 1
    fi
}

MISSING_DEPS=0

check_command "git" "Instale o git: https://git-scm.com" || MISSING_DEPS=1
check_command "docker" "Instale o Docker: https://docs.docker.com/get-docker" || MISSING_DEPS=1
check_command "docker-compose" "Instale o Docker Compose" || MISSING_DEPS=1

# Node.js (opcional dependendo da stack)
if command -v "node" &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    success "Node.js encontrado: v$NODE_VERSION"
    if [[ $(echo "$NODE_VERSION" | cut -d'.' -f1) -lt 18 ]]; then
        warning "Node.js >= 18 recomendado. Versão atual: v$NODE_VERSION"
    fi
fi

# PHP (opcional dependendo da stack)
if command -v "php" &> /dev/null; then
    PHP_VERSION=$(php --version | head -n1 | awk '{print $2}')
    success "PHP encontrado: $PHP_VERSION"
fi

if [[ $MISSING_DEPS -eq 1 ]]; then
    error "Dependências obrigatórias ausentes. Instale-as antes de continuar."
    exit 1
fi

# =============================================================================
# CONFIGURAÇÃO DO AMBIENTE
# =============================================================================

header "Configurando ambiente"

# Copiar .env se não existir
if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        success ".env criado a partir de .env.example"
        warning "Edite o .env com as configurações do seu ambiente local"
    else
        warning ".env.example não encontrado — crie o .env manualmente"
    fi
else
    info ".env já existe — mantendo configuração atual"
fi

# =============================================================================
# SETUP POR STACK
# =============================================================================

header "Detectando stack"

# Laravel
if [[ -f "composer.json" ]]; then
    info "Stack detectada: Laravel/PHP"

    if command -v "composer" &> /dev/null; then
        info "Instalando dependências PHP..."
        composer install --no-interaction

        if [[ -f "artisan" ]]; then
            info "Gerando chave da aplicação..."
            php artisan key:generate --no-interaction 2>/dev/null || true

            info "Executando migrations..."
            php artisan migrate --no-interaction 2>/dev/null || warning "Migrations falhou — verifique a conexão com o banco"
        fi
        success "Setup Laravel concluído"
    else
        warning "Composer não encontrado — instalação de deps PHP ignorada"
    fi
fi

# Node.js
if [[ -f "package.json" ]]; then
    info "Stack detectada: Node.js"

    if command -v "npm" &> /dev/null; then
        info "Instalando dependências Node.js..."
        npm install
        success "Dependências instaladas"
    fi
fi

# =============================================================================
# DOCKER
# =============================================================================

header "Configurando Docker"

if [[ -f "docker-compose.yml" ]]; then
    info "docker-compose.yml encontrado"

    read -p "Subir containers Docker? (s/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        info "Subindo containers..."
        docker-compose up -d
        success "Containers iniciados"
        info "Para ver logs: docker-compose logs -f"
    else
        info "Containers não iniciados. Use: docker-compose up -d"
    fi
else
    info "docker-compose.yml não encontrado — pulando step Docker"
fi

# =============================================================================
# CONCLUSÃO
# =============================================================================

header "Setup concluído"

success "Ambiente configurado com sucesso!"
echo ""
echo "Próximos passos:"
echo "  1. Edite o .env com suas configurações locais"
echo "  2. Execute ./scripts/doctor.sh para verificar o ambiente"
echo "  3. Leia o README.md para instruções de desenvolvimento"
echo "  4. Leia o CLAUDE.md para regras de desenvolvimento"
echo ""
