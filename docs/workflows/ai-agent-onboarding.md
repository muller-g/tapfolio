# Workflow: Onboarding de Agente de IA

Guia para integrar um agente de IA (Claude, Cursor, Copilot, etc.) ao projeto.

---

## Por que este Workflow Existe

Agentes de IA iniciam cada sessão sem memória da sessão anterior.
Para trabalhar eficientemente, precisam de contexto estruturado que possa ser lido em cada sessão.

Este workflow define como um agente deve se preparar antes de trabalhar.

---

## Leitura Obrigatória (todo início de sessão)

```
Prioridade 1 (sempre):
□ README.md — visão geral e estrutura
□ CLAUDE.md — regras de comportamento
□ AGENTS.md — guia específico para agentes

Prioridade 2 (para entender arquitetura):
□ docs/architecture/overview.md
□ docs/ai/agent-operating-model.md

Prioridade 3 (para a tarefa específica):
□ .claude/rules/<stack-em-uso>.md
□ .claude/commands/<comando-relevante>.md
□ docs/workflows/<workflow-relevante>.md
```

---

## Identificação de Contexto

Ao iniciar, o agente deve verificar:

```bash
# Identificar a stack
cat package.json 2>/dev/null | grep -E '"name|"version'
cat composer.json 2>/dev/null | grep -E '"name|"version'

# Identificar estrutura
ls -la
find . -name "*.ts" -o -name "*.php" | head -5

# Verificar estado do git
git log --oneline -5
git status

# Verificar variáveis de ambiente disponíveis
cat .env.example
```

---

## Comunicação de Contexto para o Agente

Ao solicitar uma tarefa a um agente, forneça:

### Contexto Mínimo
```
Stack: [ex: NestJS + TypeScript + PostgreSQL]
Tarefa: [descrição clara]
Arquivos relevantes: [lista de arquivos]
Contexto de negócio: [o que o sistema faz]
```

### Contexto Completo (para tarefas complexas)
```
## Contexto do Projeto
Stack: [stack completa]
Arquitetura: [monólito | microsserviços]
Autenticação: [JWT | Sanctum | Session]
ORM: [TypeORM | Eloquent | Prisma]

## Tarefa
[Descrição detalhada]

## Restrições
- [restrição 1]
- [restrição 2]

## Critérios de aceite
- [ ] [critério 1]
- [ ] [critério 2]

## Padrões obrigatórios
Seguir: .claude/rules/[stack].md
Usar o comando: /[comando-relevante]
```

---

## O Que o Agente Deve Fazer

### Ao Iniciar
```
1. Ler README.md e CLAUDE.md
2. Identificar stack e versões
3. Verificar estrutura de pastas
4. Ler regras da stack em uso
5. Confirmar entendimento da tarefa antes de codar
```

### Durante a Execução
```
1. Trabalhar em pequenos passos verificáveis
2. Reportar progresso a cada etapa
3. Perguntar se houver ambiguidade
4. Não alterar arquivos fora do escopo
5. Não fazer refatoração não solicitada
```

### Ao Finalizar
```
1. Listar todos os arquivos criados/alterados
2. Explicar o que foi feito e por quê
3. Indicar como testar
4. Indicar se precisa de ADR
5. Listar pendências (se houver)
```

---

## Ferramentas por Agente

### Claude Code (este template)
```
- Lê CLAUDE.md automaticamente
- Usa /comando para acionar commands
- Lê .claude/settings.json para permissões
- Acessa skills em .claude/skills/
```

### Cursor
```
- Lê .cursorrules ou CLAUDE.md
- Usar @file para referenciar arquivos de regras
- Incluir docs/architecture/overview.md no contexto
```

### GitHub Copilot
```
- Beneficia de CLAUDE.md no workspace
- Manter arquivos de referência abertos no editor
- Usar comentários com contexto relevante
```

### Windsurf
```
- Lê AGENTS.md nativamente
- Configurar contexto de projeto nas configurações
```

### Aider
```
aider --read CLAUDE.md --read docs/architecture/overview.md
```

---

## Checklist de Onboarding Completo do Agente

```
□ Leu README.md e CLAUDE.md
□ Identificou a stack em uso
□ Leu regras da stack (.claude/rules/)
□ Entende a tarefa e os critérios de aceite
□ Criou um plano antes de executar (tarefas > 3 passos)
□ Sabe onde documentar decisões (docs/adr/)
□ Sabe o formato de resposta esperado
```

---

*Template: my-fullstack-developer*
