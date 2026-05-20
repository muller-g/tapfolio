# Deploy Checklist — v[VERSÃO] — [AMBIENTE]

**Data:** [YYYY-MM-DD]
**Horário:** [HH:MM]
**Responsável:** [nome]
**Tipo:** [hotfix | release | feature | migration]
**Risco estimado:** [baixo | médio | alto]

---

## Resumo das Mudanças

[O que será deployado — breve descrição]

---

## Contatos de Emergência

| Papel | Nome | Contato |
|---|---|---|
| Responsável deploy | [nome] | [contato] |
| Infraestrutura | [nome] | [contato] |
| Tech Lead | [nome] | [contato] |

---

## PRÉ-DEPLOY — 24 horas antes

### Código e Qualidade
- [ ] Todos os testes passando no CI
- [ ] Code review aprovado por ao menos 1 dev
- [ ] Sem alertas críticos de lint ou type check
- [ ] Build de produção testado

### Banco de Dados
- [ ] Migrations revisadas e testadas em staging
- [ ] Rollback das migrations testado
- [ ] Backup do banco realizado
- [ ] Migrations são forward-compatible com código atual

### Testes em Staging
- [ ] Deploy realizado em staging
- [ ] Smoke tests passando
- [ ] Fluxo principal testado manualmente
- [ ] Performance não degradada

### Segurança
- [ ] Audit de dependências sem CVEs críticos
- [ ] Sem secrets em código

### Comunicação
- [ ] Time notificado
- [ ] Stakeholders informados (se janela de manutenção)

---

## PRÉ-DEPLOY — 1 hora antes

- [ ] Acesso à infraestrutura confirmado
- [ ] Monitoramento aberto e alertas ativos
- [ ] Logs abertos (Sentry, CloudWatch, etc.)
- [ ] Plano de rollback documentado
- [ ] Versão anterior identificada

---

## DURANTE O DEPLOY

- [ ] Deploy iniciado no horário planejado
- [ ] Logs sendo monitorados em tempo real
- [ ] Migrations executadas (se houver)
- [ ] Cache invalidado (se necessário)
- [ ] Workers reiniciados (se necessário)

---

## PÓS-DEPLOY — primeiros 15 minutos

- [ ] Aplicação respondendo (health check)
- [ ] Sem erros 500 no log
- [ ] Login funcionando
- [ ] Funcionalidade principal testada
- [ ] Taxa de erro normal (comparar com baseline)

---

## PÓS-DEPLOY — 30 minutos

- [ ] Métricas estáveis
- [ ] Sem alertas disparados
- [ ] Filas processando normalmente
- [ ] Tempo de resposta normal

---

## Plano de Rollback

**Gatilho:** [condição que dispara o rollback]

```bash
# Procedimento de rollback:
[descrever o procedimento específico para este deploy]
```

**Tempo estimado de rollback:** [X minutos]
**Rollback testado previamente:** [ ] Sim / [ ] Não

---

## Resultado

**Status:** [ ] Sucesso / [ ] Rollback executado / [ ] Problema parcial

**Observações:**
[anotações pós-deploy]

**Hora de conclusão:** [HH:MM]

---

*Template: my-fullstack-developer*
