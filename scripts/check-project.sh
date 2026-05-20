#!/bin/bash

# =============================================================================
# check-project.sh — Verificação rápida de saúde do projeto
# =============================================================================
# Uso: ./scripts/check-project.sh
# Descrição: Executa verificações rápidas de qualidade no projeto
# =============================================================================

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES=0

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; ((ISSUES++)); }
error() { echo -e "${RED}[ERROR]${NC} $1"; ((ISSUES++)); }

echo ""
echo -e "${BLUE}════════════════════════════════${NC}"
echo -e "${BLUE}  Check do Projeto${NC}"
echo -e "${BLUE}════════════════════════════════${NC}"
echo ""

# =============================================================================
# VERIFICAÇÕES DE SEGURANÇA
# =============================================================================

info "Verificando problemas de segurança..."

# Verificar se .env está no .gitignore
if [[ -f ".gitignore" ]]; then
    if grep -q "^\.env$" .gitignore || grep -q "^\.env" .gitignore; then
        ok ".env está no .gitignore"
    else
        error ".env NÃO está no .gitignore — RISCO DE SEGURANÇA!"
    fi
fi

# Verificar se .env está sendo rastreado pelo git
if git ls-files --error-unmatch .env &> /dev/null 2>&1; then
    error ".env está rastreado pelo Git — REMOVER IMEDIATAMENTE: git rm --cached .env"
fi

# Procurar por patterns suspeitos no código
if grep -rn "password\s*=\s*['\"][^'\"]\+" --include="*.php" --include="*.ts" --include="*.js" \
   --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=.git . 2>/dev/null | \
   grep -v ".env" | grep -v "example" | grep -v "test" | grep -v "spec" | head -5; then
    warn "Possíveis senhas hardcoded encontradas (verificar manualmente)"
fi

# =============================================================================
# VERIFICAÇÕES DE CONFIGURAÇÃO
# =============================================================================

info "Verificando configuração..."

# Verificar .env.example
if [[ -f ".env.example" ]]; then
    ok ".env.example existe"

    # Verificar se .env tem todas as chaves do .env.example
    if [[ -f ".env" ]]; then
        MISSING_KEYS=0
        while IFS= read -r line; do
            if [[ "$line" =~ ^[A-Z_]+=.* ]]; then
                KEY=$(echo "$line" | cut -d'=' -f1)
                if ! grep -q "^${KEY}=" .env 2>/dev/null; then
                    warn "Chave ausente no .env: $KEY"
                    MISSING_KEYS=1
                fi
            fi
        done < .env.example
        [[ $MISSING_KEYS -eq 0 ]] && ok ".env tem todas as chaves do .env.example"
    fi
else
    warn ".env.example não encontrado"
fi

# =============================================================================
# VERIFICAÇÕES DE GIT
# =============================================================================

info "Verificando estado do Git..."

# Verificar arquivos não commitados
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [[ "$UNCOMMITTED" -eq 0 ]]; then
    ok "Nenhum arquivo não commitado"
else
    warn "$UNCOMMITTED arquivo(s) não commitado(s)"
fi

# Verificar branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "desconhecida")
info "Branch atual: $CURRENT_BRANCH"

# =============================================================================
# VERIFICAÇÕES DE DEPENDÊNCIAS
# =============================================================================

info "Verificando dependências..."

# Node.js
if [[ -f "package.json" ]]; then
    if [[ -d "node_modules" ]]; then
        ok "node_modules instalado"

        # Verificar vulnerabilidades
        if command -v "npm" &> /dev/null; then
            AUDIT_RESULT=$(npm audit --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('critical',0))" 2>/dev/null || echo "0")
            if [[ "$AUDIT_RESULT" -gt 0 ]]; then
                error "$AUDIT_RESULT vulnerabilidade(s) crítica(s) em npm — Execute: npm audit fix"
            else
                ok "Sem vulnerabilidades críticas em npm"
            fi
        fi
    else
        warn "node_modules não instalado — Execute: npm install"
    fi
fi

# PHP
if [[ -f "composer.json" ]]; then
    if [[ -d "vendor" ]]; then
        ok "vendor instalado"
    else
        warn "vendor não instalado — Execute: composer install"
    fi
fi

# =============================================================================
# RESUMO
# =============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════${NC}"

if [[ $ISSUES -eq 0 ]]; then
    echo -e "  ${GREEN}✓ Sem problemas encontrados${NC}"
    exit 0
else
    echo -e "  ${RED}✗ $ISSUES problema(s) encontrado(s)${NC}"
    echo ""
    echo -e "  Corrija os itens acima antes de continuar."
    exit 1
fi
