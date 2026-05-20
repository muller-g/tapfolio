# Visão Geral da Arquitetura — TapFolio

**Stack:** Laravel 11 (API) + Next.js 14 (Frontend) + PostgreSQL + Redis + Docker
**Data:** 2026-05
**Status:** ativo

---

## Princípios Arquiteturais

1. **Separação de responsabilidades** — API stateless, frontend desacoplado
2. **Dependências na direção certa** — controllers finos, services ricos
3. **Testabilidade** — toda lógica de negócio testável sem infraestrutura
4. **Observabilidade** — logs estruturados, health check, métricas
5. **Segurança por padrão** — autenticação JWT, rate limiting, HTTPS

---

## Visão Geral do Sistema

```
┌──────────────────────────────────────────────────────┐
│                      Clientes                        │
│          Browser (Next.js)    Mobile (futuro)        │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼───────────────────────────────────┐
│                    Nginx (Reverse Proxy)              │
│         SSL Termination + Rate Limiting Básico        │
│         /api/* → Laravel  |  /* → Next.js            │
└──────────┬────────────────────────┬──────────────────┘
           │                        │
┌──────────▼──────────┐   ┌─────────▼────────┐
│   Laravel 11 API    │   │  Next.js 14 App  │
│   Port: 8000        │   │  Port: 3000      │
│   PHP 8.3           │   │  TypeScript      │
│   Sanctum (JWT)     │   │  App Router      │
│   Laravel Queues    │   │  Tailwind CSS    │
└──────────┬──────────┘   └──────────────────┘
           │
┌──────────▼──────────────────────────────────┐
│           Serviços de Dados                  │
├──────────────┬──────────────┬───────────────┤
│  PostgreSQL  │    Redis     │   MinIO        │
│  Port: 5432  │  Port: 6379  │  Port: 9000   │
│  Dados       │  Cache +     │  Uploads      │
│  principais  │  Filas +     │  (avatares)   │
│              │  Rate limit  │               │
└──────────────┴──────────────┴───────────────┘
           │
┌──────────▼──────────────────────────────────┐
│           Serviços Externos                  │
│  SMTP (email) | Sentry (erros)              │
└─────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
tapfolio/
├── backend/                 # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # Controllers finos
│   │   │   ├── Requests/         # FormRequests (validação)
│   │   │   └── Resources/        # API Resources (transformação)
│   │   ├── Services/             # Lógica de negócio
│   │   ├── Repositories/         # Acesso a dados
│   │   ├── Models/               # Eloquent models
│   │   └── Events/ + Listeners/  # Side effects assíncronos
│   ├── database/
│   │   ├── migrations/
│   │   └── factories/
│   └── tests/
│       ├── Unit/
│       └── Feature/
│
├── frontend/                # Next.js 14 App Router
│   ├── src/
│   │   ├── app/             # Rotas (App Router)
│   │   ├── components/
│   │   │   ├── ui/          # Primitivos (Button, Input)
│   │   │   ├── layout/      # Header, Footer
│   │   │   └── features/    # Componentes de domínio
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Chamadas à API
│   │   ├── stores/          # Zustand (estado global)
│   │   └── types/           # TypeScript types
│   └── public/
│
├── nginx/
│   └── nginx.conf           # Configuração do reverse proxy
│
├── docker-compose.yml       # Orquestração dev + prod
├── docker-compose.dev.yml   # Overrides de desenvolvimento
└── .env.example             # Variáveis necessárias
```

---

## Camadas do Backend (Laravel)

```
┌─────────────────────────────────────────────────────┐
│               Presentation Layer                     │
│   Controllers (finos) + FormRequests + Resources    │
│   Responsabilidade: receber request, validar input  │
│                     retornar response formatada     │
├─────────────────────────────────────────────────────┤
│               Application Layer                      │
│          Services + Events + Listeners              │
│       Responsabilidade: orquestrar negócio          │
│       Ex: ProfileService, LinkService               │
├─────────────────────────────────────────────────────┤
│               Domain Layer                           │
│          Models (Eloquent) + Enums                  │
│   Responsabilidade: representar entidades e regras  │
├─────────────────────────────────────────────────────┤
│             Infrastructure Layer                     │
│       Repositories + External APIs + Cache          │
│       Responsabilidade: acesso a dados              │
└─────────────────────────────────────────────────────┘
```

---

## Autenticação

```
Tipo: Laravel Sanctum — tokens de API stateless

Access Token:
  - Expiração: 1 hora
  - Header: Authorization: Bearer {token}
  - Armazenamento no cliente: memória (não localStorage)

Refresh Token:
  - Expiração: 30 dias
  - Armazenamento: HttpOnly Cookie

Endpoints:
  POST /api/v1/auth/register
  POST /api/v1/auth/login
  POST /api/v1/auth/refresh
  POST /api/v1/auth/logout
  POST /api/v1/auth/forgot-password
  POST /api/v1/auth/reset-password
```

---

## Endpoints Principais (v1.0)

```
Público:
  GET  /api/v1/profiles/:username        → perfil público
  POST /api/v1/links/:id/click           → registrar clique

Autenticado:
  GET  /api/v1/profile                   → meu perfil
  PUT  /api/v1/profile                   → atualizar perfil
  POST /api/v1/profile/avatar            → upload avatar

  GET  /api/v1/links                     → meus links
  POST /api/v1/links                     → criar link
  PUT  /api/v1/links/:id                 → editar link
  DELETE /api/v1/links/:id               → excluir link
  PUT  /api/v1/links/reorder             → reordenar links

  GET  /api/v1/analytics/summary         → resumo de cliques
  GET  /api/v1/analytics/links           → cliques por link
```

---

## Decisões de Tecnologia

| Aspecto | Escolha | Motivo |
|---|---|---|
| Backend API | Laravel 11 (PHP 8.3) | Ecossistema maduro, Sanctum nativo, Eloquent ORM |
| Frontend | Next.js 14 (App Router) | SSG para perfis públicos, TypeScript nativo |
| Banco de dados | PostgreSQL 16 | Robustez, suporte a JSON, melhor para escalar |
| Cache / Filas | Redis | Laravel Queue driver nativo, rate limiting |
| Armazenamento | MinIO (self-hosted) | Compatible com S3, gratuito em VPS |
| Reverse proxy | Nginx | SSL termination, roteamento /api vs /* |
| Containers | Docker + Compose | Padronização de ambiente dev → prod |
| CI/CD | GitHub Actions | Integração nativa com o repositório |
| Monitoramento de erros | Sentry | SDK nativo para Laravel e Next.js |

---

## Estratégia de Cache

```
Redis — L2 cache:
  - Perfis públicos: TTL 5 minutos (alta leitura, baixa escrita)
  - Rate limiting de login: por IP, janela de 15 minutos
  - Contagem de cliques: buffer antes de persistir no banco

Next.js ISR (Incremental Static Regeneration):
  - Páginas de perfil público geradas estaticamente
  - Revalidação a cada 60 segundos
  - Cache invalidado via revalidatePath() ao atualizar perfil
```

---

*Última atualização: 2026-05*
