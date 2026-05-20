# Visão Geral da Arquitetura

> Este documento descreve a arquitetura geral do template e como projetos derivados devem ser estruturados.
> Adapte conforme a stack e contexto do seu projeto.

---

## Princípios Arquiteturais

1. **Separação de responsabilidades** — cada camada tem um papel claro
2. **Dependências na direção certa** — camadas internas não conhecem camadas externas
3. **Extensibilidade** — novos módulos devem ser adicionados sem modificar os existentes
4. **Testabilidade** — toda lógica de negócio deve ser testável sem infraestrutura
5. **Observabilidade** — todo sistema deve ter logs, métricas e alertas

---

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         Clientes                            │
│          Web App    Mobile App    Integração Externa         │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────────┐
│                    CDN / Load Balancer                       │
│                    (Cloudflare, AWS ALB)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                      API Gateway / Nginx                     │
│              (Rate Limiting, SSL Termination)                │
└────────┬───────────────────────────────┬────────────────────┘
         │                               │
┌────────▼─────────┐           ┌─────────▼────────┐
│  Backend API      │           │  Frontend App     │
│  Laravel/NestJS   │           │  Next.js/React    │
│  Port: 8000       │           │  Port: 3000       │
└────────┬─────────┘           └──────────────────┘
         │
┌────────▼──────────────────────────────────────┐
│               Serviços de Dados                │
├──────────────┬──────────────┬─────────────────┤
│   MySQL /    │   Redis      │   Armazenamento  │
│   PostgreSQL │   (Cache,    │   (S3, MinIO)    │
│              │   Filas,     │                  │
│              │   Sessão)    │                  │
└──────────────┴──────────────┴─────────────────┘
         │
┌────────▼──────────────────────────────────────┐
│            Serviços Externos                   │
│  Email | SMS | Pagamento | Webhooks | APIs     │
└────────────────────────────────────────────────┘
```

---

## Camadas da Aplicação Backend

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│   Controllers • Route Handlers • WebSocket Handlers     │
│   Responsabilidade: receber request, retornar response  │
├─────────────────────────────────────────────────────────┤
│                   Application Layer                      │
│          Services • Use Cases • DTOs • Events           │
│       Responsabilidade: orquestrar lógica de negócio    │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                         │
│        Entities • Value Objects • Domain Events         │
│   Responsabilidade: regras de negócio puras (sem I/O)   │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│     Repositories • ORM Models • External APIs • Cache   │
│       Responsabilidade: acesso a dados e externos       │
└─────────────────────────────────────────────────────────┘
```

---

## Estratégia de Autenticação

```
Tipo: JWT (JSON Web Tokens) sem estado

Access Token:
  - Expiração: 1 hora
  - Payload: user_id, email, roles
  - Armazenamento cliente: memória (não localStorage)

Refresh Token:
  - Expiração: 30 dias
  - Armazenamento: HttpOnly Cookie
  - Rotação a cada uso (mais seguro)

Para Laravel: Sanctum (SPA) ou Passport (OAuth)
Para NestJS: passport-jwt + estratégia customizada
```

---

## Estratégia de Cache

```
Camadas:
  L1 — Application cache (in-memory, processo)
       TTL: segundos a minutos
       Uso: dados ultra-frequentes, config da aplicação

  L2 — Redis
       TTL: minutos a horas
       Uso: resultados de queries, sessões, filas, rate limit

  L3 — HTTP Cache (CDN, browser)
       TTL: horas a dias
       Uso: assets estáticos, respostas GET públicas

Invalidação:
  - Tag-based: invalidar por domínio ao atualizar
  - Time-based: TTL adequado para cada tipo de dado
  - Event-based: invalidar ao receber evento de atualização
```

---

## Estratégia de Filas

```
Workers assíncronos para:
  - Envio de emails e notificações
  - Geração de PDFs e relatórios
  - Integração com APIs externas (retry automático)
  - Processamento de imagens
  - Webhooks recebidos

Prioridades:
  high    → pagamentos, webhooks críticos
  default → emails transacionais, notificações
  low     → relatórios, exports, processamento batch

Driver: Redis (desenvolvimento) → SQS/RabbitMQ (produção escalável)
```

---

## Estratégia de Escalabilidade

```
Horizontal (recomendada):
  - Múltiplas instâncias do backend (load balancer)
  - Session em Redis (não em arquivo local)
  - Armazenamento de arquivo em S3 (não em disco local)
  - Workers em instâncias separadas

Vertical (quando necessário):
  - Aumento de CPU/memória para banco de dados
  - Connection pooling para banco (PgBouncer)
```

---

## Decisões de Tecnologia Padrão

| Aspecto | Padrão Recomendado | Alternativa |
|---|---|---|
| Backend API | NestJS (TypeScript) | Laravel (PHP) |
| Frontend Web | Next.js | React + Vite |
| Banco Principal | PostgreSQL | MySQL |
| Cache/Fila | Redis | — |
| Containers | Docker + Compose | — |
| CI/CD | GitHub Actions | GitLab CI |
| Deploy | VPS + Docker | AWS ECS / Railway |
| Monitoramento | Sentry + Uptime | Datadog |
| Armazenamento | AWS S3 | MinIO (self-hosted) |

---

## Adicionando à Arquitetura

Para adicionar um novo módulo ao sistema:

1. Criar a estrutura de pastas do módulo
2. Definir o schema de banco (migration)
3. Criar a entidade/model
4. Criar o repository com interface
5. Criar o service com lógica de negócio
6. Criar o controller com endpoints
7. Registrar rotas e módulo
8. Criar testes
9. Atualizar documentação de API
10. Criar ADR se houver decisão arquitetural relevante

---

*Última atualização: 2026-05*
