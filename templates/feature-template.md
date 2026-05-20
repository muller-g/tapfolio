# Feature: [Nome da Feature]

**Data:** [YYYY-MM-DD]
**Autor:** [nome]
**Status:** [planejamento | em desenvolvimento | em review | concluída]
**Branch:** `feature/[nome]`

---

## Contexto e Motivação

[Por que esta feature é necessária? Qual problema resolve?]

---

## Objetivo

[O que esta feature vai entregar? Critério de sucesso claro.]

---

## Escopo

### Incluso
- [o que faz parte desta feature]

### Excluído (para o futuro)
- [o que NÃO está nesta feature]

---

## Especificação Técnica

### Banco de Dados
```
Novas tabelas:
  - [tabela_name]: [propósito]
    Campos: [field1 (type), field2 (type)]

Alterações em tabelas existentes:
  - [tabela_name]: adicionar campo [field_name]
```

### Endpoints de API
```
POST   /api/v1/[resource]    → [descrição]
GET    /api/v1/[resource]    → [descrição]
GET    /api/v1/[resource]/:id → [descrição]
```

### Componentes Frontend (se aplicável)
```
- [NomeComponente]: [responsabilidade]
- [NomePagina]: [rota /path]
```

---

## Plano de Implementação

```
[ ] 1. Migration de banco de dados
[ ] 2. Model/Entity
[ ] 3. Repository
[ ] 4. Service
[ ] 5. Controller/Handler
[ ] 6. Validação (FormRequest/DTO)
[ ] 7. Testes unitários
[ ] 8. Testes de integração
[ ] 9. Frontend (se aplicável)
[ ] 10. Documentação de API
```

---

## Critérios de Aceite

```
[ ] [critério 1 verificável]
[ ] [critério 2 verificável]
[ ] [critério 3 verificável]
```

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| [risco] | alta/média/baixa | alto/médio/baixo | [como mitigar] |

---

## Estimativa

**Esforço total:** [X horas / X dias]
**Prazo:** [data prevista de conclusão]

---

*Template: my-fullstack-developer*
