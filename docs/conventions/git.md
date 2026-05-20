# Convenções de Git

Fluxo de trabalho Git para times e projetos profissionais.

---

## Estratégia de Branches

### Modelo: GitFlow Simplificado

```
main        → produção (sempre deployável)
develop     → integração de features (pré-produção)
feature/*   → desenvolvimento de features
fix/*       → correção de bugs
hotfix/*    → correção urgente direto da main
release/*   → preparação de release (testes finais)
docs/*      → documentação apenas
chore/*     → tarefas de manutenção (deps, config)
```

### Fluxo de uma Feature
```
1. Criar branch a partir de develop
   git checkout -b feature/auth-jwt-refresh develop

2. Desenvolver com commits pequenos e atômicos

3. Atualizar com develop antes de abrir PR
   git rebase develop

4. Abrir Pull Request para develop

5. Após aprovação: merge via squash (1 commit no develop)

6. Deletar branch após merge
```

### Fluxo de um Hotfix (produção)
```
1. Criar branch a partir de main
   git checkout -b hotfix/payment-null-error main

2. Implementar correção mínima

3. PR para main E para develop

4. Tag de versão após merge em main
   git tag -a v2.1.1 -m "fix: payment null error"
```

---

## Proteção de Branches

```
main:
  - Require PR review (min 1)
  - Require CI passing
  - No direct push
  - No force push

develop:
  - Require PR review (min 1)
  - Require CI passing
  - No direct push
```

---

## Tags de Versão

```
Formato: v{MAJOR}.{MINOR}.{PATCH}

MAJOR: mudança incompatível com versão anterior
MINOR: nova funcionalidade compatível
PATCH: correção de bug compatível

Exemplos:
v1.0.0  → primeira versão de produção
v1.1.0  → nova feature adicionada
v1.1.1  → bug corrigido
v2.0.0  → breaking change (ex: nova versão de API)
```

---

## .gitignore Padrão

```
# Ambiente
.env
.env.local
.env.production

# Dependências
node_modules/
vendor/

# Build
dist/
build/
.next/

# Sistema
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/settings.json
*.swp

# Logs
*.log
logs/

# Temporários
tmp/
temp/
*.tmp
```

---

## Comandos Frequentes

```bash
# Criar branch de feature
git checkout -b feature/minha-feature develop

# Atualizar branch com develop
git fetch origin && git rebase origin/develop

# Desfazer último commit (mantendo alterações)
git reset --soft HEAD~1

# Ver histórico resumido
git log --oneline --graph --decorate -20

# Verificar o que cada linha fez
git blame src/arquivo.ts

# Buscar commit por mensagem
git log --grep="auth"

# Criar tag de versão
git tag -a v1.2.0 -m "release: v1.2.0"
git push origin v1.2.0
```

---

*Versão: 1.0.0 — 2026-05*
