# Padrões de API REST

Padrões obrigatórios para design e implementação de APIs.

---

## Princípios

1. **Consistência** — todas as APIs do projeto seguem os mesmos padrões
2. **Previsibilidade** — o comportamento segue convenções claras
3. **Versionamento** — mudanças incompatíveis não quebram clientes existentes
4. **Segurança** — autenticação e autorização em cada endpoint
5. **Documentação** — OpenAPI/Swagger sempre atualizado

---

## URL Design

```
Formato: /api/v{n}/{recurso}/{id}/{sub-recurso}

Recursos: substantivos, plural, snake_case
  ✅ /api/v1/users
  ✅ /api/v1/order-items
  ✅ /api/v1/users/:id/orders

  ❌ /api/v1/getUsers
  ❌ /api/v1/user (singular)
  ❌ /api/v1/UserOrders
```

## HTTP Methods

```
GET    /resources           → listar (paginado)
POST   /resources           → criar
GET    /resources/:id       → buscar por ID
PUT    /resources/:id       → substituir completamente
PATCH  /resources/:id       → atualizar parcialmente
DELETE /resources/:id       → remover

Ações especiais (verbos):
POST /resources/:id/activate    → ativar recurso
POST /resources/:id/cancel      → cancelar
POST /resources/:id/publish     → publicar
```

---

## Padrão de Resposta

### Sucesso com dados
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "created_at": "2026-05-19T10:00:00Z"
  }
}
```

### Lista paginada
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7,
    "from": 1,
    "to": 15
  }
}
```

### Erro de validação (422)
```json
{
  "success": false,
  "message": "Os dados fornecidos são inválidos",
  "errors": {
    "email": ["O campo email é obrigatório", "Formato de email inválido"],
    "password": ["A senha deve ter pelo menos 8 caracteres"]
  }
}
```

### Erro genérico
```json
{
  "success": false,
  "message": "Recurso não encontrado",
  "code": "RESOURCE_NOT_FOUND"
}
```

---

## Paginação e Filtros

```
Paginação:
  GET /api/v1/users?page=2&per_page=20

Filtros:
  GET /api/v1/orders?status=pending&user_id=5

Busca:
  GET /api/v1/products?search=teclado

Ordenação:
  GET /api/v1/users?sort_by=created_at&order_dir=desc

Padrões:
  - per_page padrão: 15
  - per_page máximo: 100
  - sort_by padrão: created_at
  - order_dir: asc | desc
```

---

## Versionamento

```
Estratégia: URL versioning (/api/v1/, /api/v2/)

Quando criar nova versão:
  - Mudança no formato de resposta
  - Remoção de campo
  - Mudança de comportamento incompatível

Manter versão antiga por:
  - Mínimo 6 meses após lançamento da nova
  - Comunicar deprecação com antecedência
  - Header de deprecação: Sunset: Sat, 01 Nov 2026 00:00:00 GMT
```

---

## Autenticação

```
Bearer Token (JWT):
  Authorization: Bearer eyJhbGc...

Fluxo:
  POST /api/v1/auth/login → retorna access_token e refresh_token
  GET  /api/v1/me         → retorna usuário autenticado
  POST /api/v1/auth/refresh → renova access_token
  POST /api/v1/auth/logout  → invalida tokens
```

---

## Rate Limiting

```
Headers de resposta:
  X-RateLimit-Limit: 60
  X-RateLimit-Remaining: 45
  X-RateLimit-Reset: 1716102060

Limites por tipo:
  Endpoints públicos:   60 req/min por IP
  Endpoints auth:       30 req/min por usuário
  Login/Register:       5 req/15min por IP
  Endpoints admin:      100 req/min por usuário
```

---

*Versão: 1.0.0 — 2026-05*
