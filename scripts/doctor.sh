#!/bin/bash

# =============================================================================
# doctor.sh — Verifica a saúde do ambiente de desenvolvimento
# =============================================================================
# Uso: ./scripts/doctor.sh
# Descrição: Verifica ferramentas, versões e configurações necessárias
# =============================================================================

set -uo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
PASSED=0
WARNED=0
FAILED=0

# Funções
pass() { echo -e "  ${GREEN}✓${NC} $1"; ((PASSED++)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; ((WARNED++)); }
fail() { echo -e "  ${RED}✗${NC} $1"; ((FAILED++)); }
section() { echo -e "\n${BLUE}▶ $1${NC}"; }

echo ""
echo -e "${BLUE}════════════════════════════════${NC}"
echo -e "${BLUE}  Doctor — Verificação do Ambiente${NC}"
echo -e "${BLUE}════════════════════════════════${NC}"

# =============================================================================
# FERRAMENTAS OBRIGATÓRIAS
# =============================================================================

section "Ferramentas obrigatórias"

check_version() {
    local cmd=$1
    local min_version=$2
    local get_version=$3

    if command -v "$cmd" &> /dev/null; then
        local version
        version=$(eval "$get_version" 2>/dev/null || echo "0")
        pass "$cmd instalado ($version)"
    else
        fail "$cmd não encontrado"
    fi
}

check_version "git" "2.0" "git --version | awk '{print \$3}'"
check_version "docker" "20.0" "docker --version | awk '{print \$3}' | tr -d ','"

# Docker Compose
if command -v "docker-compose" &> /dev/null || docker compose version &> /dev/null 2>&1; then
    pass "docker-compose instalado"
else
    fail "docker-compose não encontrado"
fi

# =============================================================================
# NODE.JS
# =============================================================================

section "Node.js"

if command -v "node" &> /dev/null; then
    NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    NODE_VERSION=$(node --version)
    if [[ $NODE_MAJOR -ge 18 ]]; then
        pass "Node.js $NODE_VERSION (>= 18 ✓)"
    elif [[ $NODE_MAJOR -ge 16 ]]; then
        warn "Node.js $NODE_VERSION (recomendado >= 18)"
    else
        fail "Node.js $NODE_VERSION (mínimo >= 16)"
    fi

    if command -v "npm" &> /dev/null; then
        pass "npm $(npm --version)"
    fi
else
    warn "Node.js não encontrado (necessário para projetos JS/TS)"
fi

# =============================================================================
# PHP
# =============================================================================

section "PHP"

if command -v "php" &> /dev/null; then
    PHP_VERSION=$(php --version | head -n1 | awk '{print $2}')
    PHP_MAJOR=$(echo "$PHP_VERSION" | cut -d'.' -f1)
    PHP_MINOR=$(echo "$PHP_VERSION" | cut -d'.' -f2)

    if [[ $PHP_MAJOR -ge 8 && $PHP_MINOR -ge 2 ]]; then
        pass "PHP $PHP_VERSION (>= 8.2 ✓)"
    elif [[ $PHP_MAJOR -ge 8 ]]; then
        warn "PHP $PHP_VERSION (recomendado >= 8.2)"
    else
        fail "PHP $PHP_VERSION (mínimo >= 8.0)"
    fi

    if command -v "composer" &> /dev/null; then
        pass "Composer $(composer --version | awk '{print $3}')"
    else
        warn "Composer não encontrado (necessário para projetos Laravel)"
    fi
else
    warn "PHP não encontrado (necessário para projetos Laravel)"
fi

# =============================================================================
# ARQUIVOS DE CONFIGURAÇÃO
# =============================================================================

section "Arquivos de configuração"

check_file() {
    local file=$1
    local description=$2
    if [[ -f "$file" ]]; then
        pass "$description ($file)"
    else
        warn "$description não encontrado ($file)"
    fi
}

check_file ".env" "Arquivo de ambiente (.env)"
check_file ".env.example" ".env.example"
check_file "README.md" "README.md"
check_file "CLAUDE.md" "CLAUDE.md"

# Verificar se .env tem variáveis mínimas
if [[ -f ".env" ]]; then
    if grep -q "APP_KEY=" .env && ! grep -q "APP_KEY=$" .env; then
        pass "APP_KEY configurada"
    else
        warn "APP_KEY não configurada no .env"
    fi
fi

# =============================================================================
# DOCKER
# =============================================================================

section "Docker"

if docker info &> /dev/null 2>&1; then
    pass "Docker daemon rodando"

    if [[ -f "docker-compose.yml" ]]; then
        pass "docker-compose.yml encontrado"

        # Verificar containers rodando
        RUNNING=$(docker-compose ps --services --filter "status=running" 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$RUNNING" -gt 0 ]]; then
            pass "$RUNNING container(s) rodando"
        else
            warn "Nenhum container rodando. Use: docker-compose up -d"
        fi
    fi
else
    warn "Docker daemon não está rodando"
fi

# =============================================================================
# GIT
# =============================================================================

section "Git"

if [[ -d ".git" ]]; then
    pass "Repositório Git inicializado"

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    pass "Branch atual: $CURRENT_BRANCH"

    if git remote get-url origin &> /dev/null 2>&1; then
        pass "Remote origin configurado"
    else
        warn "Remote origin não configurado"
    fi
else
    warn "Não é um repositório Git. Use: git init"
fi

# =============================================================================
# RESUMO
# =============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════${NC}"
echo -e "  Resultado: ${GREEN}$PASSED passou${NC} | ${YELLOW}$WARNED avisos${NC} | ${RED}$FAILED falhou${NC}"
echo -e "${BLUE}════════════════════════════════${NC}"
echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}⚠ Problemas encontrados. Corrija os itens com ✗ antes de continuar.${NC}"
    exit 1
elif [[ $WARNED -gt 0 ]]; then
    echo -e "${YELLOW}Ambiente configurado com avisos. Verifique os itens com ⚠.${NC}"
    exit 0
else
    echo -e "${GREEN}✓ Ambiente configurado corretamente!${NC}"
    exit 0
fi
