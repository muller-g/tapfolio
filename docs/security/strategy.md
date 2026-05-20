# Estratégia de Segurança

Abordagem completa de segurança para aplicações fullstack.

---

## Princípio: Defense in Depth

Segurança em múltiplas camadas:

```
Camada 1: Rede        → Firewall, DDoS protection, Cloudflare
Camada 2: Infraestrutura → VPC, Security Groups, HTTPS
Camada 3: Aplicação   → Auth, RBAC, Rate limiting, Input validation
Camada 4: Dados       → Criptografia, acesso mínimo
Camada 5: Monitoramento → Logs, alertas, detecção de anomalias
```

---

## Autenticação

```
Estratégia: JWT + Refresh Token

Access Token:
  - Duração: 1 hora
  - Armazenamento: memória (não localStorage, não cookie sem HttpOnly)
  - Payload: user_id, email, roles, exp

Refresh Token:
  - Duração: 30 dias
  - Armazenamento: HttpOnly Cookie (não acessível via JS)
  - Rotação: novo refresh token a cada uso
  - Revogação: persistido e verificado no servidor

Proteções:
  - Rate limiting: 5 tentativas por 15 min por IP
  - Lockout: conta bloqueada após 10 falhas
  - Brute force: CAPTCHA após 3 falhas
```

---

## Autorização (RBAC)

```
Modelo: Role-Based Access Control

Roles típicas:
  super_admin → acesso total ao sistema
  admin       → gerencia usuários e configurações
  manager     → gerencia recursos do negócio
  user        → acesso ao próprio perfil e recursos

Implementação:
  - Verificar role ANTES de qualquer operação
  - Owner-check: usuário só acessa seus próprios dados
  - ABAC para regras mais granulares (Attribute-Based)
```

---

## Proteção de Dados

```
Em trânsito:
  - HTTPS obrigatório em todos os ambientes
  - TLS 1.2 mínimo, TLS 1.3 preferido
  - HSTS com preload

Em repouso:
  - Senhas: bcrypt (fator 12) ou argon2id
  - Dados PII sensíveis: AES-256 criptografados
  - Backups: criptografados

Exposição mínima:
  - API retorna apenas campos necessários
  - PII mascarado em logs (CPF → ***.***.123-**)
  - Dados de cartão nunca armazenados (tokenização via gateway)
```

---

## Headers de Segurança

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-{NONCE}'";
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

---

## Gestão de Dependências

```
- Executar npm audit / composer audit semanalmente
- CVEs críticos: corrigir em 24 horas
- CVEs altos: corrigir em 1 semana
- Versões de produção fixadas (no * ou ^latest)
- Dependências revisadas antes de adicionar
```

---

## Monitoramento de Segurança

```
Logar e alertar para:
  - Tentativas de login falhadas (> 3 em 5 min)
  - Acesso a recursos sem permissão (403)
  - Tokens inválidos ou expirados
  - Padrões de acesso anômalos
  - Erros 5xx acima do threshold

Não logar:
  - Senhas (mesmo erradas)
  - Tokens completos
  - Dados sensíveis
```

---

## Checklist de Segurança por Release

```
[ ] Audit de dependências executado
[ ] OWASP Top 10 verificado para novas features
[ ] Penetration test agendado (a cada 6 meses)
[ ] Headers de segurança verificados
[ ] Certificados SSL válidos e renovados
[ ] Variáveis de ambiente revisadas
[ ] Backups testados
[ ] Plano de resposta a incidentes atualizado
```

---

*Versão: 1.0.0 — 2026-05*
