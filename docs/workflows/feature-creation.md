# Workflow: Criação de Feature

Fluxo completo para criar uma nova feature de forma estruturada e segura.

---

## Visão Geral

```
Requisito → Análise → Planejamento → Branch → Implementação → Testes → PR → Review → Merge
```

---

## Passo a Passo

### 1. Receber e Entender o Requisito

```
□ Ler o requisito na íntegra
□ Identificar o que precisa ser construído
□ Identificar o que NÃO está no escopo
□ Esclarecer ambiguidades com o solicitante
□ Confirmar critérios de aceite
```

### 2. Análise Técnica

```
□ Identificar entidades de banco afetadas
□ Mapear endpoints de API necessários
□ Mapear telas/componentes necessários
□ Verificar código existente que pode ser reutilizado
□ Identificar dependências de outras features
□ Estimar esforço
```

### 3. Criar Branch

```bash
# Sempre a partir de develop (nunca de main diretamente)
git checkout develop
git pull origin develop
git checkout -b feature/auth-forgot-password
```

### 4. Implementar Backend (se necessário)

```
Ordem recomendada:
1. Migration (banco de dados)
2. Model/Entity
3. Repository
4. Service (lógica de negócio)
5. Controller (endpoints)
6. Validation (FormRequest/DTO)
7. Resource (transformação de resposta)
8. Routes
```

### 5. Implementar Frontend (se necessário)

```
Ordem recomendada:
1. Tipos TypeScript
2. Service (chamadas de API)
3. Store/Hook de dados
4. Componentes de UI
5. Página/View
6. Rota
```

### 6. Criar Testes

```
Para cada módulo criado:
□ Testes unitários do Service/Use Case
□ Testes de integração dos endpoints
□ Testes de componente (frontend)
□ Cobertura mínima: happy path + 2 casos de erro
```

### 7. Validação Final

```
□ Todos os testes passam
□ Lint sem erros
□ Type check sem erros
□ Testado manualmente no fluxo completo
□ Sem dados sensíveis expostos
□ Documentação atualizada
□ .env.example atualizado (se novas variáveis)
```

### 8. Pull Request

```
□ Título seguindo Conventional Commits
□ Descrição com o quê e o porquê
□ Screenshots para mudanças visuais
□ Checklist de PR preenchido
□ Branch atualizada com develop
```

### 9. Code Review

```
□ Aguardar review de 1+ pessoa
□ Resolver todos os comentários
□ Re-testar após mudanças do review
```

### 10. Merge e Cleanup

```
□ Merge via squash (1 commit limpo no develop)
□ Deletar branch local e remota
□ Verificar deploy automático em staging
□ Testar em staging
```

---

## Tempo Estimado por Tipo de Feature

| Tamanho | Exemplos | Estimativa |
|---|---|---|
| Pequena | Novo campo, novo endpoint simples | 2-4h |
| Média | CRUD completo, fluxo de auth | 1-2 dias |
| Grande | Módulo completo, integração externa | 3-5 dias |
| XL | Novo sistema, arquitetura | 1-3 semanas |

---

## Checklist de Conclusão

```
[ ] Feature funciona no fluxo completo
[ ] Testes passam (unitários e integração)
[ ] Sem regressão em funcionalidades existentes
[ ] PR aprovado e mergeado
[ ] Deploy em staging verificado
[ ] Documentação atualizada
```

---

*Template: my-fullstack-developer*
