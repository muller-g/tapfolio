# Tratamento de Erros — Backend

## Filosofia

Erros são eventos esperados, não exceções ao fluxo. O sistema deve tratar falhas com:
- **Respostas consistentes** — mesmo formato em todos os endpoints
- **Mensagens claras** — sem expor stack traces em produção
- **Logging adequado** — contexto suficiente para investigação
- **HTTP correto** — status codes semânticos

---

## Formato de Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuário não encontrado",
    "details": null,
    "trace_id": "req_abc123xyz"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}
```

Para erros de validação (`422 Unprocessable Entity`):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "email": ["O email é obrigatório", "Formato de email inválido"],
      "name": ["O nome deve ter no mínimo 3 caracteres"]
    }
  }
}
```

---

## Códigos de Erro por Domínio

### Autenticação (`AUTH_*`)
| Código | HTTP | Descrição |
|--------|------|-----------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email/senha incorretos |
| `AUTH_TOKEN_EXPIRED` | 401 | Token JWT expirado |
| `AUTH_TOKEN_INVALID` | 401 | Token JWT inválido ou malformado |
| `AUTH_REFRESH_EXPIRED` | 401 | Refresh token expirado — refazer login |
| `AUTH_FORBIDDEN` | 403 | Autenticado, mas sem permissão |

### Recursos (`RESOURCE_*`)
| Código | HTTP | Descrição |
|--------|------|-----------|
| `RESOURCE_NOT_FOUND` | 404 | Entidade não encontrada |
| `RESOURCE_ALREADY_EXISTS` | 409 | Conflito — dado duplicado |
| `RESOURCE_GONE` | 410 | Recurso removido permanentemente |

### Validação (`VALIDATION_*`)
| Código | HTTP | Descrição |
|--------|------|-----------|
| `VALIDATION_ERROR` | 422 | Campos inválidos (ver `details`) |
| `VALIDATION_FILE_TOO_LARGE` | 413 | Arquivo excede tamanho máximo |
| `VALIDATION_UNSUPPORTED_FORMAT` | 415 | Formato não suportado |

### Sistema (`SYS_*`)
| Código | HTTP | Descrição |
|--------|------|-----------|
| `SYS_INTERNAL_ERROR` | 500 | Erro interno não tratado |
| `SYS_SERVICE_UNAVAILABLE` | 503 | Dependência externa indisponível |
| `SYS_TIMEOUT` | 504 | Timeout em operação |

---

## Implementação — Laravel

### Exception Handler (`app/Exceptions/Handler.php`)

```php
<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $e): Response
    {
        if ($request->expectsJson()) {
            return $this->renderApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function renderApiException($request, Throwable $e): JsonResponse
    {
        $traceId = $request->header('X-Request-ID', uniqid('req_'));

        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Dados inválidos',
                    'details' => $e->errors(),
                    'trace_id' => $traceId,
                ],
            ], 422);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'AUTH_TOKEN_INVALID',
                    'message' => 'Não autenticado',
                    'details' => null,
                    'trace_id' => $traceId,
                ],
            ], 401);
        }

        if ($e instanceof AppException) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $e->getCode(),
                    'message' => $e->getMessage(),
                    'details' => $e->getDetails(),
                    'trace_id' => $traceId,
                ],
            ], $e->getHttpStatus());
        }

        if ($e instanceof HttpException) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'HTTP_ERROR',
                    'message' => $e->getMessage() ?: 'Erro HTTP',
                    'details' => null,
                    'trace_id' => $traceId,
                ],
            ], $e->getStatusCode());
        }

        // Erro não tratado — log completo, resposta genérica
        logger()->error('Unhandled exception', [
            'exception' => $e,
            'trace_id' => $traceId,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => false,
            'error' => [
                'code' => 'SYS_INTERNAL_ERROR',
                'message' => app()->isProduction()
                    ? 'Erro interno. Tente novamente.'
                    : $e->getMessage(),
                'details' => null,
                'trace_id' => $traceId,
            ],
        ], 500);
    }
}
```

### Exception de Domínio Base

```php
<?php

namespace App\Exceptions;

use Exception;

class AppException extends Exception
{
    public function __construct(
        private readonly string $errorCode,
        string $message,
        private readonly int $httpStatus = 400,
        private readonly mixed $details = null,
    ) {
        parent::__construct($message);
    }

    public function getCode(): string
    {
        return $this->errorCode;
    }

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }

    public function getDetails(): mixed
    {
        return $this->details;
    }
}
```

### Exceptions de Domínio Específicas

```php
// app/Exceptions/Domain/UserNotFoundException.php
class UserNotFoundException extends AppException
{
    public function __construct(int $userId)
    {
        parent::__construct(
            errorCode: 'RESOURCE_NOT_FOUND',
            message: "Usuário #{$userId} não encontrado",
            httpStatus: 404,
        );
    }
}

// Uso no Service
class UserService
{
    public function findById(int $id): User
    {
        $user = $this->repository->findById($id);

        if (!$user) {
            throw new UserNotFoundException($id);
        }

        return $user;
    }
}
```

---

## Implementação — NestJS

### Global Exception Filter

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = request.headers['x-request-id'] as string ?? `req_${Date.now()}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'SYS_INTERNAL_ERROR';
    let message = 'Erro interno. Tente novamente.';
    let details: unknown = null;

    if (exception instanceof AppException) {
      status = exception.httpStatus;
      code = exception.errorCode;
      message = exception.message;
      details = exception.details ?? null;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const msgs = (exceptionResponse as any).message;
        code = 'VALIDATION_ERROR';
        message = 'Dados inválidos';
        details = Array.isArray(msgs) ? msgs : [msgs];
      } else {
        message = exception.message;
        code = `HTTP_${status}`;
      }
    } else {
      this.logger.error('Unhandled exception', {
        error: exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
        traceId,
        url: request.url,
        method: request.method,
      });
    }

    response.status(status).json({
      success: false,
      error: { code, message, details, trace_id: traceId },
      meta: { timestamp: new Date().toISOString(), version: 'v1' },
    });
  }
}
```

### Exception de Domínio Base (NestJS)

```typescript
// src/common/exceptions/app.exception.ts
export class AppException extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly httpStatus: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppException';
  }
}

// Exceptions específicas
export class NotFoundException extends AppException {
  constructor(resource: string, id: number | string) {
    super('RESOURCE_NOT_FOUND', `${resource} #${id} não encontrado`, 404);
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super('RESOURCE_ALREADY_EXISTS', message, 409);
  }
}
```

---

## Regras OBRIGATÓRIAS

- Nunca expor stack traces em produção
- Sempre logar erros 5xx com contexto completo (user_id, trace_id, url)
- Usar `trace_id` para rastrear requests entre serviços
- Validação sempre retorna `422` com `details` por campo
- Erros de domínio usam exceptions específicas, nunca strings genéricas
