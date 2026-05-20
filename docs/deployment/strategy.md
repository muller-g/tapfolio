# Estratégia de Deploy

Abordagem de deploy, ambientes e CI/CD para projetos fullstack.

---

## Ambientes

| Ambiente | Branch | Deploy | Objetivo |
|---|---|---|---|
| `development` | local | manual | Desenvolvimento local |
| `staging` | develop | automático (CI/CD) | Testes integrados e QA |
| `production` | main | manual com aprovação | Usuários finais |

---

## Fluxo de Deploy

```
1. Developer abre PR para develop
2. CI executa: lint + tests + build + security audit
3. PR revisado e aprovado
4. Merge em develop → deploy automático em staging
5. QA valida em staging
6. PR de develop → main aprovado
7. Merge em main → deploy em produção (aprovação humana)
8. Monitoramento pós-deploy (30 min)
9. Rollback se necessário
```

---

## Pipeline CI/CD (GitHub Actions)

```yaml
# Simplificado — ver .github/workflows/ci.yml para completo
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  ci:
    steps:
      - checkout
      - install dependencies (with cache)
      - lint
      - type check
      - unit tests
      - integration tests
      - build
      - security audit

  deploy-staging:
    needs: ci
    if: branch == develop
    steps:
      - build docker image
      - push to registry
      - deploy to staging
      - smoke tests
      
  deploy-production:
    needs: ci
    if: branch == main
    environment: production  # requires manual approval
    steps:
      - deploy to production
      - health check
      - notify team
```

---

## Estratégia de Zero Downtime

```
Para deploys sem interrupção:

1. Rolling deploy (containers):
   - Novo container sobe antes de derrubar o antigo
   - Load balancer remove antigo após health check

2. Blue-Green (alta criticidade):
   - Dois ambientes idênticos (Blue = atual, Green = novo)
   - Switch gradual de tráfego
   - Rollback em segundos

3. Migrations não-destrutivas:
   - Sempre manter compatibilidade com schema anterior durante deploy
   - Fase 1: código suporta schema atual e novo
   - Fase 2: executar migration
   - Fase 3: remover código de compatibilidade
```

---

## Rollback

```
Triggers de rollback automático:
  - Health check falha após deploy
  - Taxa de erro 5xx > 5% por 5 minutos
  - Tempo de resposta > 3x baseline

Procedimento manual:
  1. Reverter para versão anterior no deployment tool
  2. Verificar se rollback de migration é necessário
  3. Validar que serviço está saudável
  4. Comunicar time e stakeholders

Tempo máximo de rollback: 5 minutos
```

---

## Checklist de Deploy

Ver template completo em: `templates/deploy-checklist-template.md`

Resumo:
```
PRÉ-DEPLOY:
[ ] Testes passando no CI
[ ] Testado em staging
[ ] Backup do banco realizado
[ ] Plano de rollback definido
[ ] Team notificado

PÓS-DEPLOY:
[ ] Health check ok
[ ] Taxa de erro normal
[ ] Funcionalidade principal testada
[ ] Monitoramento ativo
```

---

*Versão: 1.0.0 — 2026-05*
