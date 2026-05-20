# Convenções de Nomenclatura

Padrões de nomes para código, arquivos, banco de dados e APIs.

---

## Idioma

```
INGLÊS: todos os nomes técnicos
  - Variáveis, funções, classes
  - Arquivos e pastas
  - Banco de dados (tabelas, colunas)
  - Endpoints de API
  - Commits e branches
  - Chaves de configuração/ambiente

PORTUGUÊS BRASILEIRO: conteúdo
  - Documentação e comentários
  - Mensagens de erro para o usuário
  - Logs de sistema
  - Conteúdo de emails e notificações
```

---

## Código

### Geral
```
Variáveis e funções:  camelCase → userName, getUserById
Constantes:           SCREAMING_SNAKE_CASE → MAX_LOGIN_ATTEMPTS
Classes e Interfaces: PascalCase → UserService, CreateUserDto
Tipos e Enums:        PascalCase → UserRole, OrderStatus
```

### PHP/Laravel
```
Classes:              PascalCase → UserController, OrderService
Métodos:              camelCase → findByEmail, createOrder
Variáveis:            camelCase → $userName, $orderItems
Views (Blade):        kebab-case → user-profile.blade.php
```

### TypeScript/Node
```
Classes/Interfaces:   PascalCase → UserService, IUserRepository
Funções/Métodos:      camelCase → findByEmail, createOrder
Variáveis:            camelCase → userName, orderItems
Constantes:           SCREAMING_SNAKE_CASE → MAX_RETRY_COUNT
Tipos/Enums:          PascalCase → UserRole, OrderStatus
Arquivos:             kebab-case → user.service.ts, create-user.dto.ts
```

---

## Arquivos e Pastas

```
Pastas:               kebab-case → user-profile/, order-items/
Arquivos genéricos:   kebab-case → user-profile.ts, order-service.ts
Componentes React/Vue: PascalCase → UserCard.tsx, OrderList.vue
Arquivos de config:   lowercase → .env, .gitignore, package.json
```

---

## Banco de Dados

```
Tabelas:        snake_case, plural → users, order_items, payment_methods
Colunas:        snake_case → user_id, created_at, is_active
PKs:            id (BIGINT UNSIGNED AUTO_INCREMENT)
FKs:            {tabela_ref}_id → user_id, order_id
Índices:        idx_{tabela}_{coluna} → idx_users_email
FKs nomeadas:   fk_{tabela}_{ref} → fk_orders_users
Tabelas pivot:  {entidade_a}_{entidade_b} → order_products
```

---

## APIs REST

```
Recursos:         snake_case, plural → /api/v1/users, /api/v1/order-items
Parâmetros URL:   snake_case → /users/:user_id
Query params:     snake_case → ?sort_by=created_at&order_dir=desc
Headers:          PascalCase → Authorization, Content-Type, X-Request-ID
```

---

## Branches e Commits

```
Branches:
  feature/auth-jwt-refresh
  fix/users-n1-query
  hotfix/payment-null-error
  docs/update-api-docs
  chore/update-dependencies

Commits (Conventional Commits):
  feat(auth): add JWT refresh token rotation
  fix(users): prevent N+1 query on listing
  docs(api): document users endpoint
```

---

## Booleans

```
Prefixo com is, has, can, should, did:

is_active, isLoading
has_subscription, hasPermission
can_edit, canManage
should_notify, shouldRetry
did_confirm, didComplete
```

---

*Versão: 1.0.0 — 2026-05*
