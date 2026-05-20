#!/bin/bash

# =============================================================================
# generate-docs.sh — Gera documentação automática do projeto
# =============================================================================
# Uso: ./scripts/generate-docs.sh [--type <api|code|all>]
# Descrição: Gera e consolida documentação técnica do projeto
# =============================================================================

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TYPE="${1:-all}"
DOCS_DIR="docs/generated"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
DATE=$(date +"%Y-%m-%d")

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo -e "${BLUE}════════════════════════════════════${NC}"
echo -e "${BLUE}  Geração de Documentação${NC}"
echo -e "${BLUE}════════════════════════════════════${NC}"
echo ""

# =============================================================================
# SETUP
# =============================================================================

mkdir -p "$DOCS_DIR"
info "Diretório de saída: $DOCS_DIR"

# =============================================================================
# ÍNDICE DO PROJETO
# =============================================================================

generate_index() {
    info "Gerando índice do projeto..."

    local INDEX_FILE="$DOCS_DIR/index.md"

    cat > "$INDEX_FILE" << EOF
# Índice do Projeto

> Gerado automaticamente em: $TIMESTAMP

## Estrutura de Arquivos

\`\`\`
$(find . -type f \( -name "*.md" -o -name "*.ts" -o -name "*.php" -o -name "*.js" \) \
    --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=.git \
    --exclude-dir=dist --exclude-dir=.next 2>/dev/null | \
    grep -v "node_modules\|vendor\|\.git\|dist\|\.next" | \
    sort | head -100)
\`\`\`

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
$(for f in .claude/commands/*.md 2>/dev/null; do
    [ -f "$f" ] && echo "| \`/$(basename "$f" .md)\` | $(head -3 "$f" | grep -o 'Descrição:.*' | cut -d: -f2- | xargs || echo "Ver $f") |"
done)

## Skills Disponíveis

$(for d in .claude/skills/*/; do
    [ -d "$d" ] && echo "- **$(basename "$d")**"
done)

## Regras Ativas

$(for f in .claude/rules/*.md 2>/dev/null; do
    [ -f "$f" ] && echo "- \`$(basename "$f" .md)\`"
done)
EOF

    success "Índice gerado: $INDEX_FILE"
}

# =============================================================================
# DOCUMENTAÇÃO DE API (OpenAPI / Swagger)
# =============================================================================

generate_api_docs() {
    info "Gerando documentação de API..."

    # NestJS — exportar swagger se disponível
    if [[ -f "package.json" ]] && grep -q "@nestjs/swagger" package.json 2>/dev/null; then
        info "NestJS detectado — tentando exportar Swagger..."

        if command -v "npm" &> /dev/null && [[ -f "src/main.ts" ]]; then
            warn "Execute manualmente: npm run docs:generate (se configurado no package.json)"
        fi
    fi

    # Laravel — exportar rotas
    if [[ -f "artisan" ]]; then
        info "Laravel detectado — exportando rotas..."
        local ROUTES_FILE="$DOCS_DIR/api-routes.md"

        {
            echo "# Rotas da API"
            echo ""
            echo "> Gerado em: $TIMESTAMP"
            echo ""
            echo "\`\`\`"
            php artisan route:list --path=api 2>/dev/null || echo "Falha ao listar rotas (banco pode não estar disponível)"
            echo "\`\`\`"
        } > "$ROUTES_FILE"

        success "Rotas exportadas: $ROUTES_FILE"
    fi

    # Procurar por arquivos de spec OpenAPI
    local OPENAPI_FILES
    OPENAPI_FILES=$(find . -name "openapi.json" -o -name "openapi.yaml" -o -name "swagger.json" \
        2>/dev/null | grep -v "node_modules\|vendor\|\.git" | head -5)

    if [[ -n "$OPENAPI_FILES" ]]; then
        success "Arquivos OpenAPI encontrados:"
        echo "$OPENAPI_FILES" | while read -r f; do
            echo "  - $f"
            cp "$f" "$DOCS_DIR/" 2>/dev/null && success "  Copiado para $DOCS_DIR/"
        done
    fi
}

# =============================================================================
# CHANGELOG AUTOMÁTICO
# =============================================================================

generate_changelog() {
    info "Gerando CHANGELOG a partir do Git..."

    local CHANGELOG_FILE="$DOCS_DIR/CHANGELOG.md"

    if ! git rev-parse --git-dir &> /dev/null 2>&1; then
        warn "Não é um repositório Git — pulando CHANGELOG"
        return
    fi

    {
        echo "# CHANGELOG"
        echo ""
        echo "> Gerado automaticamente em: $TIMESTAMP"
        echo ""

        # Agrupar commits por tipo (Conventional Commits)
        local CURRENT_TAG
        CURRENT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

        if [[ -n "$CURRENT_TAG" ]]; then
            echo "## Desde $CURRENT_TAG"
            echo ""
            git log "${CURRENT_TAG}..HEAD" --pretty=format:"%s" 2>/dev/null | \
                grep -E "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?: " | \
                sort | while read -r commit; do
                    echo "- $commit"
                done
            echo ""
        fi

        # Últimos 30 commits agrupados por tipo
        echo "## Histórico Recente"
        echo ""

        declare -A COMMIT_TYPES
        COMMIT_TYPES=(
            ["feat"]="Novas Funcionalidades"
            ["fix"]="Correções de Bug"
            ["docs"]="Documentação"
            ["refactor"]="Refatoração"
            ["perf"]="Performance"
            ["test"]="Testes"
            ["chore"]="Manutenção"
            ["ci"]="CI/CD"
        )

        for type in feat fix docs refactor perf test chore ci; do
            local COMMITS
            COMMITS=$(git log --pretty=format:"%s" --max-count=50 2>/dev/null | \
                grep -E "^${type}(\(.+\))?: " | head -10)

            if [[ -n "$COMMITS" ]]; then
                echo "### ${COMMIT_TYPES[$type]}"
                echo ""
                echo "$COMMITS" | while read -r c; do
                    echo "- $c"
                done
                echo ""
            fi
        done

    } > "$CHANGELOG_FILE"

    success "CHANGELOG gerado: $CHANGELOG_FILE"
}

# =============================================================================
# DEPENDÊNCIAS
# =============================================================================

generate_dependencies_doc() {
    info "Documentando dependências..."

    local DEPS_FILE="$DOCS_DIR/dependencies.md"

    {
        echo "# Dependências do Projeto"
        echo ""
        echo "> Gerado em: $TIMESTAMP"
        echo ""

        if [[ -f "package.json" ]]; then
            echo "## Node.js (package.json)"
            echo ""
            echo "### Produção"
            echo "\`\`\`json"
            python3 -c "
import json, sys
with open('package.json') as f:
    pkg = json.load(f)
deps = pkg.get('dependencies', {})
for k, v in sorted(deps.items()):
    print(f'  \"{k}\": \"{v}\"')
" 2>/dev/null || echo "Erro ao ler package.json"
            echo "\`\`\`"
            echo ""

            echo "### Desenvolvimento"
            echo "\`\`\`json"
            python3 -c "
import json, sys
with open('package.json') as f:
    pkg = json.load(f)
deps = pkg.get('devDependencies', {})
for k, v in sorted(deps.items()):
    print(f'  \"{k}\": \"{v}\"')
" 2>/dev/null || echo "Erro ao ler package.json"
            echo "\`\`\`"
            echo ""
        fi

        if [[ -f "composer.json" ]]; then
            echo "## PHP (composer.json)"
            echo ""
            echo "\`\`\`json"
            python3 -c "
import json
with open('composer.json') as f:
    pkg = json.load(f)
for section in ['require', 'require-dev']:
    deps = pkg.get(section, {})
    if deps:
        print(f'### {section}')
        for k, v in sorted(deps.items()):
            print(f'  \"{k}\": \"{v}\"')
        print()
" 2>/dev/null || echo "Erro ao ler composer.json"
            echo "\`\`\`"
            echo ""
        fi

    } > "$DEPS_FILE"

    success "Dependências documentadas: $DEPS_FILE"
}

# =============================================================================
# RELATÓRIO DE COBERTURA DE TESTES
# =============================================================================

generate_test_report() {
    info "Verificando relatório de testes..."

    local TEST_FILE="$DOCS_DIR/test-coverage.md"

    {
        echo "# Cobertura de Testes"
        echo ""
        echo "> Verificado em: $TIMESTAMP"
        echo ""

        # Jest (Node.js/TypeScript)
        if [[ -f "jest.config.js" ]] || [[ -f "jest.config.ts" ]]; then
            echo "## Jest"
            echo ""

            if [[ -d "coverage" ]]; then
                echo "### Relatório de Cobertura"
                echo ""

                if [[ -f "coverage/coverage-summary.json" ]]; then
                    python3 -c "
import json
with open('coverage/coverage-summary.json') as f:
    data = json.load(f)
total = data.get('total', {})
print('| Tipo | % | Cobertura |')
print('|------|---|-----------|')
for metric in ['lines', 'statements', 'functions', 'branches']:
    m = total.get(metric, {})
    pct = m.get('pct', 0)
    covered = m.get('covered', 0)
    total_n = m.get('total', 0)
    status = '✅' if pct >= 80 else '⚠️' if pct >= 60 else '❌'
    print(f'| {metric.capitalize()} | {pct}% | {covered}/{total_n} {status} |')
" 2>/dev/null || echo "Relatório de cobertura não disponível. Execute: npm test -- --coverage"
                else
                    echo "Execute \`npm test -- --coverage\` para gerar o relatório."
                fi
            else
                echo "Cobertura não gerada ainda. Execute: \`npm test -- --coverage\`"
            fi
        fi

        # PHPUnit (Laravel)
        if [[ -f "phpunit.xml" ]] || [[ -f "phpunit.xml.dist" ]]; then
            echo "## PHPUnit"
            echo ""

            if [[ -f "coverage/index.html" ]]; then
                echo "Relatório HTML disponível em: \`coverage/index.html\`"
            else
                echo "Execute \`php artisan test --coverage\` para gerar o relatório."
            fi
        fi

        echo ""
        echo "## Arquivos de Teste"
        echo ""

        local TEST_COUNT
        TEST_COUNT=$(find . \( -name "*.test.ts" -o -name "*.spec.ts" -o -name "*Test.php" \
            -o -name "*.test.js" -o -name "*.spec.js" \) \
            --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=.git 2>/dev/null | \
            grep -v "node_modules\|vendor\|\.git" | wc -l | tr -d ' ')

        echo "Total de arquivos de teste encontrados: **$TEST_COUNT**"

    } > "$TEST_FILE"

    success "Relatório de testes gerado: $TEST_FILE"
}

# =============================================================================
# EXECUÇÃO
# =============================================================================

case "$TYPE" in
    api)
        generate_api_docs
        ;;
    code)
        generate_index
        generate_dependencies_doc
        generate_test_report
        ;;
    changelog)
        generate_changelog
        ;;
    all|*)
        generate_index
        generate_api_docs
        generate_changelog
        generate_dependencies_doc
        generate_test_report
        ;;
esac

# =============================================================================
# RESUMO
# =============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════${NC}"
echo -e "${GREEN}  Documentação gerada em: $DOCS_DIR/${NC}"
echo -e "${BLUE}════════════════════════════════════${NC}"
echo ""
echo "Arquivos gerados:"
find "$DOCS_DIR" -type f -name "*.md" -o -name "*.json" -o -name "*.yaml" 2>/dev/null | \
    sort | while read -r f; do
        echo "  - $f"
    done
echo ""
