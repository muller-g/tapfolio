#!/bin/bash

# =============================================================================
# validate-structure.sh — Valida a estrutura do repositório template
# =============================================================================
# Uso: ./scripts/validate-structure.sh
# Descrição: Verifica se todos os arquivos obrigatórios do template existem
# =============================================================================

set -uo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; ((PASSED++)); }
fail() { echo -e "  ${RED}✗${NC} $1 — AUSENTE"; ((FAILED++)); }
section() { echo -e "\n${BLUE}▶ $1${NC}"; }

echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}  Validação da Estrutura do Template${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

check_file() {
    [[ -f "$1" ]] && pass "$1" || fail "$1"
}

check_dir() {
    [[ -d "$1" ]] && pass "$1/" || fail "$1/"
}

# =============================================================================
# ARQUIVOS RAIZ
# =============================================================================

section "Arquivos raiz"
check_file "README.md"
check_file "CLAUDE.md"
check_file "AGENTS.md"

# =============================================================================
# .claude/
# =============================================================================

section ".claude/"
check_dir ".claude"
check_file ".claude/CLAUDE.md"
check_file ".claude/settings.json"
check_dir ".claude/commands"
check_dir ".claude/skills"
check_dir ".claude/rules"

# Commands
section ".claude/commands/"
for cmd in init-project analyze-codebase create-feature fix-bug review-code \
           create-endpoint create-page create-migration create-tests refactor \
           security-audit deploy-checklist generate-docs create-adr legacy-analysis \
           plan-task db-modeling create-crud create-auth-flow nginx-config \
           dockerize-project production-debug performance-review; do
    check_file ".claude/commands/${cmd}.md"
done

# Skills
section ".claude/skills/"
for skill in backend-architecture frontend-architecture laravel-development \
             node-development nestjs-development nextjs-development react-development \
             vue-development database-design api-design docker-devops security-review \
             testing-strategy legacy-code-analysis documentation-writer deploy-production \
             performance-optimization ai-agent-orchestration; do
    check_file ".claude/skills/${skill}/SKILL.md"
done

# Rules
section ".claude/rules/"
for rule in global security laravel nestjs react nextjs vuejs nodejs database \
            git-workflow clean-architecture apis testing docker performance cicd \
            logs accessibility documentation seo; do
    check_file ".claude/rules/${rule}.md"
done

# =============================================================================
# docs/
# =============================================================================

section "docs/"
check_dir "docs/product"
check_dir "docs/architecture"
check_dir "docs/conventions"
check_dir "docs/workflows"
check_dir "docs/security"
check_dir "docs/deployment"
check_dir "docs/database"
check_dir "docs/api"
check_dir "docs/ai"
check_dir "docs/adr"

check_file "docs/architecture/overview.md"
check_file "docs/ai/agent-operating-model.md"
check_file "docs/adr/README.md"

# =============================================================================
# templates/
# =============================================================================

section "templates/"
for tpl in feature-template bug-report-template adr-template pull-request-template \
           endpoint-template deploy-checklist-template technical-doc-template \
           environment-template docker-template api-module-template migration-template; do
    check_file "templates/${tpl}.md"
done

# =============================================================================
# scripts/
# =============================================================================

section "scripts/"
for script in setup.sh doctor.sh validate-structure.sh; do
    check_file "scripts/${script}"
    [[ -f "scripts/${script}" ]] && [[ -x "scripts/${script}" ]] && pass "  ↳ executável" || \
        [[ -f "scripts/${script}" ]] && echo -e "  ${YELLOW}⚠${NC} scripts/${script} não é executável (chmod +x)" || true
done

# =============================================================================
# RESUMO
# =============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "  Resultado: ${GREEN}$PASSED existem${NC} | ${RED}$FAILED ausentes${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}Template incompleto. Crie os $FAILED arquivo(s) ausente(s).${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Template completo e válido!${NC}"
    exit 0
fi
