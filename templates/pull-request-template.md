# Pull Request: [Título Descritivo]

## Tipo de Mudança
- [ ] Nova feature
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Melhoria de performance
- [ ] Atualização de dependências
- [ ] Documentação
- [ ] Configuração/Infraestrutura

---

## O Que Foi Feito

[Descrição clara e concisa das mudanças implementadas]

## Por Que Foi Feito

[Contexto: qual requisito, problema ou oportunidade motivou esta PR]

---

## Como Testar

1. [Passo 1 para reproduzir/testar]
2. [Passo 2]
3. [Resultado esperado]

**Ambiente de teste:** desenvolvimento local / staging

---

## Screenshots (para mudanças visuais)

| Antes | Depois |
|---|---|
| [screenshot before] | [screenshot after] |

---

## Impacto

**Endpoints afetados:** [lista de endpoints alterados]
**Banco de dados:** [migrations criadas, schema alterado]
**Breaking changes:** [sim/não — se sim, descrever]
**Performance:** [se há impacto de performance]

---

## Checklist

### Código
- [ ] Segue os padrões do projeto (`.claude/rules/`)
- [ ] Sem lógica de negócio no controller
- [ ] Sem queries N+1
- [ ] Sem dados sensíveis expostos

### Testes
- [ ] Testes unitários criados/atualizados
- [ ] Testes de integração criados/atualizados
- [ ] Todos os testes passando
- [ ] Sem regressão em testes existentes

### Documentação
- [ ] `docs/api/` atualizado (se endpoints alterados)
- [ ] `.env.example` atualizado (se novas variáveis)
- [ ] `CHANGELOG.md` atualizado (se necessário)
- [ ] ADR criado (se decisão arquitetural relevante)

### Segurança
- [ ] Input validado em endpoints
- [ ] Autorização verificada
- [ ] Sem secrets no código

---

## Notas para o Revisor

[Informações que podem ajudar o revisor, pontos de atenção específicos]

---

**Branch:** `feature/[nome]` → `develop`
**Referências:** [ticket, issue, ADR relacionados]
