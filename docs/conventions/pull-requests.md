# Convenções de Pull Requests

Processo e padrões para criação e revisão de Pull Requests.

---

## Criação de Pull Request

### Antes de Abrir
```
[ ] Código funciona localmente
[ ] Testes passando
[ ] Lint sem erros
[ ] Branch atualizada com develop/main
[ ] Auto-review feito (leia seu próprio código)
[ ] Screenshots anexadas (para mudanças visuais)
```

### Título
```
Formato: <tipo>(<escopo>): <descrição>
Exemplos:
  feat(auth): add forgot password flow
  fix(users): fix N+1 query on user listing
  refactor(orders): extract OrderService from controller
```

### Descrição (Template)
```markdown
## O que foi feito
[Descrição clara e concisa das mudanças]

## Por que foi feito
[Contexto, requisito ou problema que gerou esta PR]

## Como testar
1. [passo 1]
2. [passo 2]
3. [resultado esperado]

## Screenshots (se mudança visual)
[imagem antes/depois]

## Checklist
- [ ] Testes criados/atualizados
- [ ] Documentação atualizada
- [ ] .env.example atualizado (se novas variáveis)
- [ ] Breaking changes documentados
```

---

## Revisão de Pull Request

### Responsabilidades do Revisor
```
- Revisar em até 24h úteis
- Focar em corretude, segurança e arquitetura
- Ser construtivo e específico no feedback
- Separar críticos de sugestões
- Reconhecer o que está bom
```

### Categorias de Feedback

**🔴 Crítico (bloqueia merge):**
Vulnerabilidade de segurança, bug lógico, quebra de API

**🟡 Importante (deve corrigir):**
Violação de arquitetura, N+1 query, falta de teste crítico

**🟢 Sugestão (pode melhorar):**
Nomenclatura, extração de método, comentário útil

### Como Dar Feedback
```
✅ "O que acha de extrair esta lógica para um service?
   Ficaria mais testável e seguiria o padrão do projeto."

✅ "Este endpoint aceita input de usuário sem validação (linha 45).
   Pode adicionar o FormRequest/DTO para sanitizar?"

❌ "Está errado" (sem especificar o quê e o porquê)
❌ "Eu faria diferente" (preferência pessoal sem justificativa)
❌ "Por que você fez assim?" (tom interrogativo sem contexto)
```

---

## Merge Strategy

```
Feature branches:
  - Squash merge no develop (1 commit limpo)

Hotfix branches:
  - Merge commit (preservar histórico)

Release branches:
  - Merge commit no main (com tag de versão)
```

---

## SLAs de Review

```
PRs pequenas (< 200 linhas): review em até 4 horas
PRs médias (200-500 linhas): review em até 1 dia
PRs grandes (> 500 linhas): considerar dividir
```

---

*Versão: 1.0.0 — 2026-05*
