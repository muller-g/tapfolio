# Variáveis de Ambiente — Documentação

Documentação completa de todas as variáveis de ambiente do projeto.

---

## Como Usar

```bash
# Copiar o exemplo
cp .env.example .env

# Preencher os valores adequados para o ambiente
# Nunca commitar o .env com valores reais
```

---

## Variáveis por Categoria

### Aplicação

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `APP_NAME` | string | `My App` | sim | Nome da aplicação |
| `APP_ENV` | enum | `local` | sim | Ambiente: local, staging, production |
| `APP_DEBUG` | boolean | `true` | sim | **false em produção** |
| `APP_URL` | URL | `http://localhost` | sim | URL base da aplicação |
| `APP_KEY` | string | — | sim | Chave de criptografia (gerar com artisan) |

### Banco de Dados

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `DB_CONNECTION` | enum | `mysql` | sim | Driver: mysql, pgsql, sqlite |
| `DB_HOST` | string | `localhost` | sim | Host do banco |
| `DB_PORT` | integer | `3306` | sim | Porta do banco |
| `DB_DATABASE` | string | — | sim | Nome do banco |
| `DB_USERNAME` | string | — | sim | Usuário do banco |
| `DB_PASSWORD` | string | — | sim | Senha do banco |

### Cache e Sessão

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `CACHE_DRIVER` | enum | `redis` | sim | Driver: redis, file, array |
| `SESSION_DRIVER` | enum | `redis` | sim | Driver: redis, cookie, database |
| `REDIS_HOST` | string | `localhost` | sim | Host do Redis |
| `REDIS_PORT` | integer | `6379` | sim | Porta do Redis |
| `REDIS_PASSWORD` | string | `null` | não | Senha do Redis |

### Autenticação

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `JWT_SECRET` | string | — | sim | Secret do JWT (mínimo 32 chars) |
| `JWT_TTL` | integer | `60` | sim | Expiração do access token (minutos) |
| `JWT_REFRESH_TTL` | integer | `43200` | sim | Expiração do refresh token (minutos) |

### Email

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `MAIL_MAILER` | enum | `smtp` | sim | Driver: smtp, mailgun, ses, log |
| `MAIL_HOST` | string | — | sim | Host SMTP |
| `MAIL_PORT` | integer | `587` | sim | Porta SMTP |
| `MAIL_USERNAME` | string | — | sim | Usuário SMTP |
| `MAIL_PASSWORD` | string | — | sim | Senha SMTP |
| `MAIL_FROM_ADDRESS` | email | — | sim | Email de envio |
| `MAIL_FROM_NAME` | string | — | sim | Nome do remetente |

### Armazenamento

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `FILESYSTEM_DISK` | enum | `local` | sim | Driver: local, s3 |
| `AWS_ACCESS_KEY_ID` | string | — | condicional | Chave AWS (se S3) |
| `AWS_SECRET_ACCESS_KEY` | string | — | condicional | Secret AWS (se S3) |
| `AWS_DEFAULT_REGION` | string | `us-east-1` | condicional | Região AWS (se S3) |
| `AWS_BUCKET` | string | — | condicional | Bucket S3 |

### Integrações Externas

| Variável | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `STRIPE_KEY` | string | — | condicional | Chave pública Stripe |
| `STRIPE_SECRET` | string | — | condicional | Chave secreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | string | — | condicional | Secret do webhook Stripe |

---

## Valores por Ambiente

| Variável | Local | Staging | Produção |
|---|---|---|---|
| `APP_ENV` | `local` | `staging` | `production` |
| `APP_DEBUG` | `true` | `false` | `false` |
| `CACHE_DRIVER` | `file` ou `redis` | `redis` | `redis` |
| `MAIL_MAILER` | `log` | `smtp` | `smtp` ou `ses` |

---

## Segurança

```
Nunca commitar:
- .env com valores reais
- Credenciais de banco de produção
- API keys de serviços externos
- JWT secrets

Usar em produção:
- Secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Variáveis de ambiente do servidor (não arquivo)
- Rotação periódica de secrets
```

---

*Template: my-fullstack-developer*
