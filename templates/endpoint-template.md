# Endpoint: [MÉTODO] /api/v1/[recurso]

**Módulo:** [nome do módulo]
**Auth:** [público | autenticado | admin | [role]]
**Status:** [implementado | planejado | depreciado]
**Versão:** v1

---

## Descrição

[O que este endpoint faz em uma linha]

---

## Autenticação

```
Authorization: Bearer {access_token}
```

[ou "Este endpoint é público — sem autenticação necessária"]

---

## Request

**URL:** `[MÉTODO] /api/v1/[recurso]`

### Path Parameters
| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | integer | sim | ID do recurso |

### Query Parameters (para GET)
| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | integer | 1 | Página da listagem |
| `per_page` | integer | 15 | Itens por página |
| `sort_by` | string | created_at | Campo de ordenação |
| `order_dir` | string | desc | Direção: asc, desc |

### Body (para POST/PUT/PATCH)
```json
{
  "name": "string — obrigatório, máx 255 chars",
  "email": "string — obrigatório, formato email",
  "status": "string — opcional, enum: active|inactive"
}
```

---

## Response

### Sucesso
**Status:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "status": "active",
    "created_at": "2026-05-19T10:00:00Z",
    "updated_at": "2026-05-19T10:00:00Z"
  },
  "message": "Recurso criado com sucesso"
}
```

### Erro de Validação
**Status:** `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Os dados fornecidos são inválidos",
  "errors": {
    "email": ["O campo email é obrigatório"],
    "name": ["O campo nome deve ter no máximo 255 caracteres"]
  }
}
```

### Outros Erros Possíveis
| Status | Código | Descrição |
|---|---|---|
| 401 | UNAUTHENTICATED | Token ausente ou inválido |
| 403 | FORBIDDEN | Sem permissão para esta ação |
| 404 | NOT_FOUND | Recurso não encontrado |
| 409 | CONFLICT | Conflito de estado (ex: email duplicado) |
| 429 | RATE_LIMITED | Rate limit excedido |

---

## Exemplos

### Request (cURL)
```bash
curl -X POST https://api.exemplo.com/api/v1/users \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "minhasenha"
  }'
```

### Request (JavaScript)
```javascript
const response = await fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'João Silva', email: 'joao@exemplo.com' }),
});
const data = await response.json();
```

---

## Notas
- [informação adicional relevante]
- [limitações ou comportamentos não óbvios]

---

*Template: my-fullstack-developer*
