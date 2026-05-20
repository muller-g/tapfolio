# Modelo Operacional de Agentes de IA

> Define como agentes de IA devem trabalhar dentro de projetos derivados deste template.
> Este documento é de leitura obrigatória para qualquer agente que trabalhe no projeto.

---

## Filosofia

Agentes de IA são **membros do time de desenvolvimento**, não ferramentas.

Como membros do time, devem:
- Entender profundamente o contexto antes de agir
- Seguir os padrões estabelecidos
- Comunicar claramente o que estão fazendo
- Pedir ajuda quando houver dúvida
- Documentar decisões importantes
- Deixar o projeto melhor do que encontraram

---

## Fluxo Obrigatório de Operação

### 1. Ler a Documentação do Projeto

Antes de qualquer ação, ler na ordem:

```
1. README.md                        → Visão geral do projeto
2. CLAUDE.md                        → Regras de comportamento
3. AGENTS.md                        → Guia de onboarding para agentes
4. docs/architecture/overview.md    → Arquitetura do sistema
5. .claude/rules/<stack>.md         → Regras da stack em uso
6. docs/conventions/                → Convenções de código
```

**Tempo estimado:** 5-15 minutos de leitura antes de iniciar.

---

### 2. Entender o Contexto

Antes de codar, responder:

```
□ Qual é o objetivo do projeto?
□ Qual é a stack principal (linguagem, framework, banco)?
□ Qual é a arquitetura (monólito, microsserviços)?
□ Qual é a tarefa específica a ser realizada?
□ Quais arquivos serão afetados?
□ Existe código similar que pode ser reutilizado?
□ Há dependências de outras features?
□ Qual é o risco de regressão?
```

---

### 3. Identificar Stack e Padrões Existentes

```bash
# Verificar dependências
cat package.json | grep -E '"dependencies|"devDependencies'
composer show --installed 2>/dev/null | head -20

# Verificar estrutura
find . -type f -name "*.ts" | head -20
find . -type f -name "*.php" | head -20

# Verificar padrões existentes
ls -la app/Http/Controllers/Api/ 2>/dev/null
ls -la src/modules/ 2>/dev/null
```

---

### 4. Criar Plano Antes de Alterar Arquivos

Para qualquer tarefa com mais de 3 passos, criar e apresentar um plano:

```markdown
## Plano: [título da tarefa]

**Tipo:** [feature | bug | refactor | docs]
**Estimativa:** [X horas]
**Risco:** [baixo | médio | alto]

### Impacto
**Arquivos a criar:** [lista]
**Arquivos a alterar:** [lista]
**Funcionalidades afetadas:** [lista]

### Passos
1. [passo 1] — verificação: [como validar]
2. [passo 2] — verificação: [como validar]
3. [passo 3] — verificação: [como validar]

### Riscos
- [risco identificado] — mitigação: [como mitigar]

[aguardando aprovação antes de iniciar]
```

---

### 5. Evitar Mudanças Destrutivas

```
NUNCA sem confirmação explícita:
- Deletar arquivos ou diretórios
- Alterar configurações de ambiente de produção
- Modificar banco de dados sem migration reversível
- Alterar contratos de API sem versionamento
- Remover funcionalidades existentes
- Fazer force push em branches protegidas

SEMPRE verificar antes de agir:
- O arquivo já existe? O código já foi implementado?
- A mudança pode quebrar outras funcionalidades?
- Existe teste que vai falhar com esta mudança?
```

---

### 6. Trabalhar em Pequenas Etapas

```
Princípio: uma mudança verificável por vez

✅ Criar migration → testar → criar model → testar → criar service → testar
❌ Criar migration + model + service + controller + testes de uma vez

Cada etapa deve ser:
- Pequena o suficiente para ser compreendida
- Verificável (tem um critério de conclusão)
- Reversível (pode ser desfeita)
```

---

### 7. Validar Alterações

Após cada etapa significativa:

```
□ O código compila sem erros?
□ Os testes passam? (existentes e novos)
□ O lint não reporta novos erros?
□ Os tipos TypeScript estão corretos?
□ A funcionalidade funciona manualmente?
□ Não há dados sensíveis expostos?
□ O .env.example está atualizado?
```

---

### 8. Atualizar Documentação

Ao finalizar qualquer tarefa:

```
□ docs/api/ atualizado se endpoints foram criados/alterados
□ .env.example atualizado se novas variáveis foram adicionadas
□ README atualizado se a estrutura do projeto mudou
□ Comentários adicionados para comportamentos não óbvios
□ ADR criado para decisões arquiteturais importantes
```

---

### 9. Registrar ADRs Importantes

Criar ADR em `docs/adr/` quando:
- Escolher uma tecnologia ou biblioteca
- Definir um padrão arquitetural
- Tomar uma decisão com trade-offs significativos
- Resolver um problema com múltiplas abordagens válidas

```markdown
# ADR-XXX: [Título da Decisão]

**Status:** accepted
**Data:** YYYY-MM

## Contexto
[Por que esta decisão precisou ser tomada]

## Decisão
[O que foi decidido]

## Consequências
[Prós e contras]
```

---

### 10. Entregar Resumo Final das Mudanças

Ao concluir qualquer tarefa, informar:

```markdown
## Resumo: [nome da tarefa]

**Status:** concluído

### O que foi feito
[Descrição em 2-3 frases]

### Arquivos alterados
- [arquivo 1] — [o que mudou]
- [arquivo 2] — [o que mudou]

### Arquivos criados
- [arquivo novo] — [propósito]

### Como testar
1. [passo 1]
2. [passo 2]

### Pendências (se houver)
- [item pendente]

### ADR criado
- [sim, ADR-XXX] ou [não necessário]
```

---

## Comportamentos por Tipo de Tarefa

### Nova Feature
```
1. Ler requisito até entender completamente
2. Modelar banco (se necessário)
3. Criar migration e testar rollback
4. Criar model/entity
5. Criar service com lógica de negócio
6. Criar controller/handler
7. Criar testes
8. Criar documentação de API
```

### Correção de Bug
```
1. Reproduzir o bug ANTES de corrigir
2. Identificar a causa raiz (não apenas o sintoma)
3. Criar teste que falha com o bug
4. Implementar a correção
5. Verificar que o teste passa
6. Verificar que outros testes não quebraram
7. Documentar no commit message
```

### Refatoração
```
1. Garantir que existem testes ANTES de refatorar
2. Criar testes de caracterização se não houver
3. Refatorar em passos pequenos
4. Verificar testes após cada passo
5. Não adicionar features durante refatoração
```

---

## Limites de Autonomia

| Ação | Autonomia |
|---|---|
| Ler arquivos | ✅ Livre |
| Criar arquivos novos | ✅ Livre |
| Editar código | ✅ Com plano aprovado |
| Criar migration | ⚠️ Confirmar com usuário |
| Deletar arquivos | ⚠️ Confirmar com usuário |
| Alterar configuração de ambiente | 🔴 Sempre confirmar |
| Alterar banco de produção | 🔴 Nunca sem aprovação |

---

## Glossário para Agentes

| Termo | Significado neste projeto |
|---|---|
| Stack | Conjunto de tecnologias (ex: NestJS + PostgreSQL + Redis) |
| Feature | Funcionalidade nova com requisito definido |
| ADR | Architecture Decision Record — doc de decisão |
| Skill | Especialização de comportamento de um agente |
| Command | Instrução estruturada para tipo de tarefa |
| Migration | Alteração versionada no schema do banco |
| Thin Controller | Controller sem lógica de negócio |
| N+1 Query | Anti-pattern: N queries para buscar N registros |
| Early Return | Retornar cedo para evitar aninhamento |

---

*Versão: 1.0.0 — 2026-05*
