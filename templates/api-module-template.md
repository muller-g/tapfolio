# Módulo de API: [Nome do Módulo]

Template para documentação de módulo de API completo.

---

## Visão Geral

**Base URL:** `/api/v1/[recurso]`
**Auth:** [todos autenticados | mistos]

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| GET | `/api/v1/[recurso]` | Listar (paginado) | autenticado |
| POST | `/api/v1/[recurso]` | Criar | autenticado |
| GET | `/api/v1/[recurso]/:id` | Buscar por ID | autenticado |
| PUT | `/api/v1/[recurso]/:id` | Atualizar | autenticado |
| DELETE | `/api/v1/[recurso]/:id` | Remover | admin |

---

## Objeto: [Resource]

```json
{
  "id": 1,
  "name": "string",
  "email": "string (email)",
  "status": "active | inactive",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## Endpoints Detalhados

### GET /api/v1/[recurso]
[Ver template/endpoint-template.md para formato completo]

### POST /api/v1/[recurso]
[Ver template/endpoint-template.md para formato completo]

---

## Filtros e Paginação

```
GET /api/v1/[recurso]?page=1&per_page=15
GET /api/v1/[recurso]?status=active
GET /api/v1/[recurso]?search=texto&sort_by=name&order_dir=asc
```

---

## Erros Comuns do Módulo

| Código | Mensagem | Quando Ocorre |
|---|---|---|
| `RESOURCE_NOT_FOUND` | Recurso não encontrado | ID inválido |
| `DUPLICATE_EMAIL` | Email já cadastrado | POST com email existente |
| `INSUFFICIENT_PERMISSION` | Sem permissão | Ação de admin por user |

---

*Template: my-fullstack-developer*
