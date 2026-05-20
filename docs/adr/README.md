# Architecture Decision Records (ADRs)

Este diretório contém os registros de decisões arquiteturais do projeto.

---

## O que é um ADR?

Um ADR (Architecture Decision Record) documenta uma decisão arquitetural importante, incluindo:
- O contexto que levou à decisão
- A decisão tomada
- As alternativas consideradas
- As consequências (positivas e negativas)

---

## Como criar um ADR

Use o comando `/create-adr` ou copie o template:

```bash
cp templates/adr-template.md docs/adr/ADR-XXX-titulo-da-decisao.md
```

Siga a numeração sequencial. Nunca reutilize números.

---

## Status dos ADRs

| Status | Significado |
|---|---|
| `proposed` | Em discussão, ainda não decidido |
| `accepted` | Decisão tomada e ativa |
| `deprecated` | Não mais relevante |
| `superseded` | Substituído por outro ADR |

---

## Índice de ADRs

| Número | Título | Status | Data |
|---|---|---|---|
| [ADR-001](001-template-repository-structure.md) | Estrutura do Template Repository | accepted | 2026-05 |

---

## Regras dos ADRs

```
1. ADRs são imutáveis — nunca edite um ADR aceito
2. Para mudar uma decisão, crie um novo ADR que supersede o anterior
3. Documente alternativas descartadas — é tão valioso quanto a decisão
4. Seja honesto sobre desvantagens
5. ADR deve ser legível por alguém sem contexto anterior
```

---

*Template: my-fullstack-developer*
