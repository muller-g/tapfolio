# Logging — Backend

## Filosofia

Logs são a primeira linha de defesa na investigação de problemas em produção. Um bom log:
- Tem **contexto suficiente** para ser investigado sem acesso ao código
- É **estruturado** (JSON) — nunca texto livre não parseável
- Respeita **privacidade** — nunca loga senhas, tokens ou dados sensíveis
- Tem **nível correto** — não polui produção com DEBUG desnecessário

---

## Níveis de Log

| Nível | Quando usar |
|-------|-------------|
| `ERROR` | Falhas que impactam o usuário ou requerem ação imediata |
| `WARN` | Situações anômalas, mas recuperáveis (retry, fallback) |
| `INFO` | Eventos de negócio importantes (login, pagamento, criação de pedido) |
| `DEBUG` | Informações de diagnóstico — apenas em desenvolvimento |

**Regra:** `DEBUG` nunca em produção. `INFO` deve ser significativo, não verboso.

---

## Estrutura de Log (JSON)

```json
{
  "level": "info",
  "message": "Pedido criado com sucesso",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "order-service",
  "environment": "production",
  "trace_id": "req_abc123xyz",
  "user_id": 42,
  "context": {
    "order_id": 1234,
    "total": 299.90,
    "items_count": 3,
    "payment_method": "credit_card"
  }
}
```

---

## Campos Obrigatórios

| Campo | Descrição |
|-------|-----------|
| `level` | Nível do log |
| `message` | Mensagem clara e human-readable |
| `timestamp` | ISO 8601 em UTC |
| `service` | Nome do serviço/aplicação |
| `environment` | `production`, `staging`, `development` |
| `trace_id` | ID único do request (propagar do header `X-Request-ID`) |

## Campos Contextuais (quando disponível)

| Campo | Descrição |
|-------|-----------|
| `user_id` | ID do usuário autenticado |
| `action` | Ação realizada (`user.login`, `order.created`) |
| `duration_ms` | Tempo de execução em milissegundos |
| `context` | Objeto com dados específicos do evento |

---

## Implementação — Laravel

### Configuração (`config/logging.php`)

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['daily', 'stderr'],
    ],

    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'warning'),
        'days' => 14,
        'formatter' => \Monolog\Formatter\JsonFormatter::class,
    ],

    'stderr' => [
        'driver' => 'monolog',
        'handler' => \Monolog\Handler\StreamHandler::class,
        'handler_with' => ['stream' => 'php://stderr'],
        'formatter' => \Monolog\Formatter\JsonFormatter::class,
        'level' => env('LOG_LEVEL', 'warning'),
    ],
],
```

### Service de Logging Estruturado

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class StructuredLogger
{
    public static function info(string $message, array $context = []): void
    {
        Log::info($message, self::buildContext($context));
    }

    public static function error(string $message, array $context = [], ?\Throwable $exception = null): void
    {
        $ctx = self::buildContext($context);

        if ($exception) {
            $ctx['exception'] = [
                'class' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => collect($exception->getTrace())->take(5)->toArray(),
            ];
        }

        Log::error($message, $ctx);
    }

    public static function warn(string $message, array $context = []): void
    {
        Log::warning($message, self::buildContext($context));
    }

    private static function buildContext(array $context): array
    {
        return array_merge([
            'service' => config('app.name'),
            'environment' => app()->environment(),
            'trace_id' => request()->header('X-Request-ID', uniqid('req_')),
            'user_id' => auth()->id(),
        ], $context);
    }
}
```

### Uso nos Services

```php
class OrderService
{
    public function create(array $data): Order
    {
        $start = microtime(true);

        $order = $this->repository->create($data);

        StructuredLogger::info('order.created', [
            'action' => 'order.created',
            'context' => [
                'order_id' => $order->id,
                'total' => $order->total,
                'items_count' => $order->items()->count(),
                'duration_ms' => round((microtime(true) - $start) * 1000),
            ],
        ]);

        return $order;
    }
}
```

---

## Implementação — NestJS

### Configuração com Winston/Pino

```typescript
// src/common/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'warn',
    base: {
      service: process.env.APP_NAME ?? 'api',
      environment: process.env.NODE_ENV ?? 'development',
      version: process.env.APP_VERSION ?? 'unknown',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    redact: {
      paths: ['context.password', 'context.token', 'context.secret', 'context.credit_card'],
      censor: '[REDACTED]',
    },
  });

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.logger.error(
      {
        ...context,
        ...(error && {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        }),
      },
      message,
    );
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message);
  }
}
```

### Interceptor de Request Logging

```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          this.logger.info('http.request', {
            action: 'http.request',
            context: {
              method,
              url,
              status: response.statusCode,
              duration_ms: Date.now() - start,
              user_id: request.user?.id,
              trace_id: request.headers['x-request-id'],
            },
          });
        },
        error: (error) => {
          this.logger.error('http.request.error', {
            context: {
              method,
              url,
              duration_ms: Date.now() - start,
              trace_id: request.headers['x-request-id'],
            },
          }, error);
        },
      }),
    );
  }
}
```

---

## O Que NUNCA Logar

```
❌ Senhas (mesmo hasheadas)
❌ Tokens JWT ou API keys completos (apenas os primeiros 8 chars)
❌ Dados de cartão de crédito (PCI-DSS)
❌ CPF, RG completos (LGPD)
❌ Respostas HTTP completas (podem conter dados sensíveis)
❌ Variáveis de ambiente ($_ENV, process.env)
```

---

## Retenção e Rotação

| Ambiente | Retenção | Rotação |
|----------|----------|---------|
| Produção | 90 dias | Diária |
| Staging | 30 dias | Diária |
| Desenvolvimento | 7 dias | Diária |

Logs de segurança (tentativas de autenticação, mudanças de permissão): **1 ano**.
