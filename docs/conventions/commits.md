# Convenções de Commits

Padrão Conventional Commits para mensagens de commit claras e rastreáveis.

---

## Formato

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional — explica o POR QUÊ]

[rodapé opcional — refs, breaking changes]
```

---

## Tipos

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação sem mudança de lógica |
| `refactor` | Refatoração sem feature ou fix |
| `test` | Adicionar ou corrigir testes |
| `chore` | Manutenção, build, dependências, CI |
| `perf` | Melhoria de performance |
| `security` | Correção de vulnerabilidade |
| `ci` | Mudanças em pipeline de CI/CD |
| `revert` | Reverter commit anterior |

---

## Exemplos Corretos

```bash
# Feature nova
feat(auth): add JWT refresh token rotation

# Correção de bug com contexto
fix(orders): prevent duplicate order on double submit

# Documentação
docs(api): document POST /api/v1/users endpoint

# Refatoração
refactor(users): extract UserService from UserController

# Testes
test(orders): add integration tests for order creation flow

# Manutenção
chore(deps): update Laravel framework to v11.x

# Performance
perf(products): add database index on category_id column

# Segurança
security(auth): increase bcrypt cost factor from 10 to 12

# Breaking change
feat(api)!: change response format to include success field

BREAKING CHANGE: response now wraps data in { success, data } object
```

---

## Regras

```
✅ Usar imperativo ("add", "fix", "update" — não "added", "fixed")
✅ Máximo 72 caracteres na primeira linha
✅ Sem ponto final na primeira linha
✅ Corpo explica o porquê, não o quê
✅ Um propósito claro por commit (atômico)
✅ Em inglês

❌ "fix", "update", "changes", "wip" sem contexto
❌ Commits gigantes com múltiplas mudanças não relacionadas
❌ Commits com código quebrado ou que não compila
❌ .env com valores reais
❌ Código comentado apenas por preguiça de deletar
```

---

## Corpo do Commit (quando usar)

Use o corpo quando:
- A mudança não é óbvia e precisa de contexto
- Existe uma decisão técnica relevante
- Existe uma referência a uma issue ou ticket

```
fix(payments): handle Stripe webhook signature timeout

O timeout padrão de 5s do Stripe era insuficiente durante
picos de tráfego, causando falsos negativos de assinatura.
Aumentado para 30s conforme documentação oficial.

Refs: #234, TICKET-456
```

---

## Referências

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)

---

*Versão: 1.0.0 — 2026-05*
