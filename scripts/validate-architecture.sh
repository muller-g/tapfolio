#!/bin/bash

# =============================================================================
# validate-architecture.sh — Valida regras arquiteturais do projeto
# =============================================================================
# Uso: ./scripts/validate-architecture.sh [--stack <laravel|nestjs|nextjs>]
# Descrição: Verifica se o código segue as regras de arquitetura definidas
# =============================================================================

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
WARNED=0
FAILED=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; ((PASSED++)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; ((WARNED++)); }
fail() { echo -e "  ${RED}✗${NC} $1"; ((FAILED++)); }
section() { echo -e "\n${BLUE}▶ $1${NC}"; }
info() { echo -e "  ${BLUE}→${NC} $1"; }

echo ""
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo -e "${BLUE}  Validação de Arquitetura${NC}"
echo -e "${BLUE}══════════════════════════════════════${NC}"

# =============================================================================
# DETECÇÃO DE STACK
# =============================================================================

STACK=""
if [[ -f "artisan" ]] && [[ -f "composer.json" ]]; then
    STACK="laravel"
elif [[ -f "package.json" ]] && grep -q "@nestjs/core" package.json 2>/dev/null; then
    STACK="nestjs"
elif [[ -f "package.json" ]] && grep -q "next" package.json 2>/dev/null; then
    STACK="nextjs"
elif [[ -f "package.json" ]]; then
    STACK="node"
fi

info "Stack detectada: ${STACK:-desconhecida}"

# =============================================================================
# REGRAS GLOBAIS
# =============================================================================

section "Regras Globais"

# Verificar arquivos muito grandes (> 300 linhas)
LARGE_FILES=$(find . -type f \( -name "*.php" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
    --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=.git \
    --exclude-dir=dist --exclude-dir=.next 2>/dev/null | \
    grep -v "node_modules\|vendor\|\.git\|dist\|\.next" | \
    while read -r f; do
        lines=$(wc -l < "$f" 2>/dev/null || echo 0)
        if [[ $lines -gt 300 ]]; then
            echo "$f ($lines linhas)"
        fi
    done)

if [[ -z "$LARGE_FILES" ]]; then
    pass "Nenhum arquivo com mais de 300 linhas"
else
    warn "Arquivos com mais de 300 linhas (considere refatorar):"
    echo "$LARGE_FILES" | while read -r line; do
        info "$line"
    done
fi

# Verificar arquivos de configuração obrigatórios
[[ -f ".env.example" ]] && pass ".env.example existe" || fail ".env.example ausente"
[[ -f "README.md" ]] && pass "README.md existe" || fail "README.md ausente"
[[ -f "CLAUDE.md" ]] && pass "CLAUDE.md existe" || warn "CLAUDE.md ausente"

# =============================================================================
# VALIDAÇÃO LARAVEL
# =============================================================================

validate_laravel() {
    section "Arquitetura Laravel"

    # Verificar estrutura de diretórios esperada
    local DIRS=(
        "app/Http/Controllers"
        "app/Http/Requests"
        "app/Services"
        "app/Models"
    )

    for dir in "${DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            pass "$dir/ existe"
        else
            warn "$dir/ não encontrado (recomendado para arquitetura em camadas)"
        fi
    done

    # Verificar controllers com lógica de negócio (anti-padrão)
    section "Controladores — verificando lógica de negócio"

    local CONTROLLERS_DIR="app/Http/Controllers"
    if [[ -d "$CONTROLLERS_DIR" ]]; then
        while IFS= read -r controller; do
            # Contar linhas do método (heurística: arquivos grandes indicam lógica no controller)
            local LINES
            LINES=$(wc -l < "$controller" 2>/dev/null || echo 0)

            if [[ $LINES -gt 100 ]]; then
                warn "Controller potencialmente com lógica de negócio: $controller ($LINES linhas)"
            fi

            # Verificar queries Eloquent diretas no controller (não através de service/repository)
            local DB_CALLS
            DB_CALLS=$(grep -c "DB::select\|DB::table\|::find(\|::where(\|::create(\|->save()" "$controller" 2>/dev/null || echo 0)

            if [[ $DB_CALLS -gt 3 ]]; then
                fail "Controller com muitas queries diretas ($DB_CALLS ocorrências): $controller"
                info "Mova a lógica para um Service ou Repository"
            fi

        done < <(find "$CONTROLLERS_DIR" -name "*.php" 2>/dev/null)

        local CONTROLLER_COUNT
        CONTROLLER_COUNT=$(find "$CONTROLLERS_DIR" -name "*.php" | wc -l | tr -d ' ')
        [[ $CONTROLLER_COUNT -gt 0 ]] && pass "$CONTROLLER_COUNT controller(s) encontrado(s)"
    fi

    # Verificar uso de FormRequest para validação
    section "Validação — FormRequests"

    local REQUEST_COUNT
    REQUEST_COUNT=$(find app/Http/Requests -name "*.php" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $REQUEST_COUNT -gt 0 ]]; then
        pass "$REQUEST_COUNT FormRequest(s) encontrado(s)"
    else
        warn "Nenhum FormRequest encontrado — validação pode estar no controller"
    fi

    # Verificar Services
    section "Camada de Serviços"

    if [[ -d "app/Services" ]]; then
        local SERVICE_COUNT
        SERVICE_COUNT=$(find app/Services -name "*.php" | wc -l | tr -d ' ')
        [[ $SERVICE_COUNT -gt 0 ]] && pass "$SERVICE_COUNT Service(s) encontrado(s)" || \
            warn "Diretório Services vazio"
    fi

    # Verificar Policies para autorização
    section "Autorização — Policies"

    local POLICY_COUNT
    POLICY_COUNT=$(find app/Policies -name "*.php" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $POLICY_COUNT -gt 0 ]]; then
        pass "$POLICY_COUNT Polic(ies) encontrada(s)"
    else
        warn "Nenhuma Policy encontrada — considere usar Policies para autorização"
    fi

    # Verificar Resources para transformação de dados
    section "Transformação de Dados — Resources"

    local RESOURCE_COUNT
    RESOURCE_COUNT=$(find app/Http/Resources -name "*.php" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $RESOURCE_COUNT -gt 0 ]]; then
        pass "$RESOURCE_COUNT Resource(s) encontrado(s)"
    else
        warn "Nenhum API Resource encontrado — considere usar Resources para transformação"
    fi

    # Verificar migrations
    section "Migrations"

    local MIGRATION_COUNT
    MIGRATION_COUNT=$(find database/migrations -name "*.php" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $MIGRATION_COUNT -gt 0 ]]; then
        pass "$MIGRATION_COUNT migration(s) encontrada(s)"

        # Verificar migrations sem down() implementado
        local INCOMPLETE_MIGRATIONS
        INCOMPLETE_MIGRATIONS=$(grep -rL "public function down" database/migrations/ 2>/dev/null | wc -l | tr -d ' ')

        [[ $INCOMPLETE_MIGRATIONS -eq 0 ]] && pass "Todas migrations têm down() implementado" || \
            warn "$INCOMPLETE_MIGRATIONS migration(s) sem método down()"
    fi
}

# =============================================================================
# VALIDAÇÃO NESTJS
# =============================================================================

validate_nestjs() {
    section "Arquitetura NestJS"

    local SRC="src"
    [[ ! -d "$SRC" ]] && { warn "Diretório src/ não encontrado"; return; }

    # Estrutura de módulos
    section "Módulos"

    local MODULE_COUNT
    MODULE_COUNT=$(find "$SRC" -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $MODULE_COUNT -gt 0 ]]; then
        pass "$MODULE_COUNT módulo(s) encontrado(s)"
    else
        warn "Nenhum módulo NestJS encontrado"
    fi

    # Verificar DTOs
    section "DTOs"

    local DTO_COUNT
    DTO_COUNT=$(find "$SRC" -name "*.dto.ts" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $DTO_COUNT -gt 0 ]]; then
        pass "$DTO_COUNT DTO(s) encontrado(s)"

        # Verificar se DTOs usam class-validator
        local DTOS_SEM_VALIDATOR
        DTOS_SEM_VALIDATOR=$(grep -rL "class-validator\|IsString\|IsEmail\|IsNumber\|IsNotEmpty" \
            --include="*.dto.ts" "$SRC" 2>/dev/null | wc -l | tr -d ' ')

        [[ $DTOS_SEM_VALIDATOR -eq 0 ]] && pass "Todos DTOs usam class-validator" || \
            warn "$DTOS_SEM_VALIDATOR DTO(s) sem class-validator"
    else
        warn "Nenhum DTO encontrado — use DTOs para validação de entrada"
    fi

    # Verificar Guards
    section "Guards e Segurança"

    local GUARD_COUNT
    GUARD_COUNT=$(find "$SRC" -name "*.guard.ts" 2>/dev/null | wc -l | tr -d ' ')
    [[ $GUARD_COUNT -gt 0 ]] && pass "$GUARD_COUNT Guard(s) encontrado(s)" || \
        warn "Nenhum Guard encontrado"

    # Verificar Exception Filters
    local FILTER_COUNT
    FILTER_COUNT=$(find "$SRC" -name "*.filter.ts" 2>/dev/null | wc -l | tr -d ' ')
    [[ $FILTER_COUNT -gt 0 ]] && pass "$FILTER_COUNT Exception Filter(s) encontrado(s)" || \
        warn "Nenhum Exception Filter encontrado"

    # Verificar lógica nos controllers
    section "Controladores"

    while IFS= read -r controller; do
        local LINES
        LINES=$(wc -l < "$controller" 2>/dev/null || echo 0)

        if [[ $LINES -gt 80 ]]; then
            warn "Controller potencialmente com lógica de negócio: $controller ($LINES linhas)"
            info "Controllers devem delegar para Services"
        fi
    done < <(find "$SRC" -name "*.controller.ts" 2>/dev/null)

    local CTRL_COUNT
    CTRL_COUNT=$(find "$SRC" -name "*.controller.ts" | wc -l | tr -d ' ')
    [[ $CTRL_COUNT -gt 0 ]] && pass "$CTRL_COUNT Controller(s) encontrado(s)"

    # Verificar Services
    local SVC_COUNT
    SVC_COUNT=$(find "$SRC" -name "*.service.ts" | wc -l | tr -d ' ')
    [[ $SVC_COUNT -gt 0 ]] && pass "$SVC_COUNT Service(s) encontrado(s)" || \
        warn "Nenhum Service encontrado"

    # TypeScript strict
    section "TypeScript"

    if [[ -f "tsconfig.json" ]]; then
        if grep -q '"strict": true' tsconfig.json 2>/dev/null; then
            pass "TypeScript strict mode ativado"
        else
            warn "TypeScript strict mode não ativado — adicione \"strict\": true ao tsconfig.json"
        fi
    fi

    # any proibido
    local ANY_COUNT
    ANY_COUNT=$(grep -rn ": any\b" --include="*.ts" "$SRC" 2>/dev/null | \
        grep -v "\.spec\.\|\.test\." | grep -v "// eslint-disable" | wc -l | tr -d ' ')

    if [[ $ANY_COUNT -eq 0 ]]; then
        pass "Nenhum uso de 'any' encontrado"
    elif [[ $ANY_COUNT -lt 5 ]]; then
        warn "$ANY_COUNT uso(s) de 'any' encontrado(s) — prefira tipos explícitos"
    else
        fail "$ANY_COUNT usos de 'any' encontrados — evite o uso de 'any' em TypeScript"
    fi
}

# =============================================================================
# VALIDAÇÃO NEXT.JS
# =============================================================================

validate_nextjs() {
    section "Arquitetura Next.js"

    # App Router vs Pages Router
    if [[ -d "app" ]]; then
        pass "App Router detectado (recomendado)"
        section "Server vs Client Components"

        local CLIENT_COMPONENTS
        CLIENT_COMPONENTS=$(grep -rl "\"use client\"" app/ 2>/dev/null | wc -l | tr -d ' ')
        local TOTAL_COMPONENTS
        TOTAL_COMPONENTS=$(find app -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')

        if [[ $TOTAL_COMPONENTS -gt 0 ]]; then
            local CLIENT_PCT=$((CLIENT_COMPONENTS * 100 / TOTAL_COMPONENTS))
            if [[ $CLIENT_PCT -lt 30 ]]; then
                pass "Proporção Client Components: ${CLIENT_PCT}% (< 30% — bom)"
            elif [[ $CLIENT_PCT -lt 50 ]]; then
                warn "Proporção Client Components: ${CLIENT_PCT}% (considere mover lógica para Server Components)"
            else
                fail "Proporção Client Components: ${CLIENT_PCT}% (alto — Server Components por padrão)"
            fi
        fi

    elif [[ -d "pages" ]]; then
        warn "Pages Router detectado — considere migrar para App Router (Next.js 13+)"
    fi

    # Verificar uso de next/image
    section "Otimização de Imagens"

    local IMG_TAG_COUNT
    IMG_TAG_COUNT=$(grep -rn "<img " --include="*.tsx" --include="*.jsx" . 2>/dev/null | \
        grep -v "node_modules\|\.next" | wc -l | tr -d ' ')

    [[ $IMG_TAG_COUNT -eq 0 ]] && pass "Sem <img> tags — usando next/image corretamente" || \
        fail "$IMG_TAG_COUNT <img> tag(s) encontrada(s) — use next/image para otimização"

    # Verificar metadata
    section "SEO e Metadata"

    local META_COUNT
    META_COUNT=$(grep -rl "generateMetadata\|export.*metadata" --include="*.tsx" --include="*.ts" \
        app/ 2>/dev/null | wc -l | tr -d ' ')
    [[ $META_COUNT -gt 0 ]] && pass "$META_COUNT arquivo(s) com metadata configurada" || \
        warn "Nenhum generateMetadata encontrado — configure SEO nas páginas"
}

# =============================================================================
# VALIDAÇÃO DE TESTES
# =============================================================================

section "Testes"

TOTAL_SOURCE=0
TOTAL_TESTS=0

if [[ -d "src" ]]; then
    TOTAL_SOURCE=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
        ! -name "*.spec.*" ! -name "*.test.*" 2>/dev/null | wc -l | tr -d ' ')
    TOTAL_TESTS=$(find src -type f \( -name "*.spec.ts" -o -name "*.test.ts" \) 2>/dev/null | \
        wc -l | tr -d ' ')
elif [[ -d "app" ]] && [[ "$STACK" == "laravel" ]]; then
    TOTAL_SOURCE=$(find app -name "*.php" 2>/dev/null | wc -l | tr -d ' ')
    TOTAL_TESTS=$(find tests -name "*.php" 2>/dev/null | wc -l | tr -d ' ')
fi

if [[ $TOTAL_SOURCE -gt 0 ]]; then
    local RATIO=0
    [[ $TOTAL_TESTS -gt 0 ]] && RATIO=$((TOTAL_TESTS * 100 / TOTAL_SOURCE))

    if [[ $RATIO -ge 50 ]]; then
        pass "Cobertura de arquivos de teste: ${RATIO}% ($TOTAL_TESTS testes / $TOTAL_SOURCE fontes)"
    elif [[ $RATIO -ge 20 ]]; then
        warn "Cobertura de arquivos de teste: ${RATIO}% — aumente a cobertura de testes"
    else
        fail "Cobertura de arquivos de teste: ${RATIO}% — muito baixa ($TOTAL_TESTS testes / $TOTAL_SOURCE fontes)"
    fi
fi

# =============================================================================
# EXECUÇÃO POR STACK
# =============================================================================

case "$STACK" in
    laravel)   validate_laravel ;;
    nestjs)    validate_nestjs ;;
    nextjs)    validate_nextjs ;;
    node)      info "Stack Node.js genérica — validações globais aplicadas" ;;
    *)         warn "Stack não identificada — apenas regras globais aplicadas" ;;
esac

# =============================================================================
# RESUMO
# =============================================================================

echo ""
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo -e "  Resultado: ${GREEN}$PASSED passou${NC} | ${YELLOW}$WARNED avisos${NC} | ${RED}$FAILED falhou${NC}"
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}✗ Violações arquiteturais encontradas. Corrija os itens com ✗.${NC}"
    exit 1
elif [[ $WARNED -gt 0 ]]; then
    echo -e "${YELLOW}Arquitetura OK com avisos. Revise os itens com ⚠.${NC}"
    exit 0
else
    echo -e "${GREEN}✓ Arquitetura validada com sucesso!${NC}"
    exit 0
fi
