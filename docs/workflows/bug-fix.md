# Workflow: Correção de Bug

Fluxo estruturado para identificar, corrigir e prevenir bugs.

---

## Regra de Ouro

**Nunca corrija um bug sem entender a causa raiz.**
Corrigir o sintoma é temporário — o bug voltará em outra forma.

---

## Passo a Passo

### 1. Triagem

```
□ Qual é o comportamento esperado?
□ Qual é o comportamento atual?
□ Como reproduzir (passos exatos)?
□ Em qual ambiente ocorre? (prod | staging | dev | todos)
□ Afeta todos os usuários ou apenas alguns?
□ Quando começou? Houve deploy recente?
□ Qual é o impacto no negócio? (crítico | alto | médio | baixo)
```

### 2. Reproduzir Localmente

```bash
# Tentar reproduzir com os passos fornecidos
# Se não conseguir reproduzir, pedir mais informações

# Verificar logs relevantes
tail -f storage/logs/laravel.log     # Laravel
pm2 logs --lines 100                # Node.js
docker-compose logs -f app          # Docker
```

### 3. Identificar Causa Raiz

```bash
# Verificar histórico — quando o bug foi introduzido?
git log --oneline -20
git bisect start  # para localizar commit problemático

# Analisar stack trace
# Identificar o arquivo e linha exatos
# Rastrear o fluxo de execução até o erro
```

Perguntas de diagnóstico:
```
- A causa é no código ou nos dados?
- É um problema de concorrência?
- É um problema de configuração?
- Existe um edge case não tratado?
- É regressão de uma mudança recente?
```

### 4. Criar Branch

```bash
git checkout -b fix/orders-duplicate-payment develop
# ou para hotfix de produção:
git checkout -b hotfix/orders-null-pointer main
```

### 5. Criar Teste que Falha

**Antes de corrigir**, criar um teste que:
- Reproduz o bug
- Falha com o código atual
- Passará após a correção

```php
// Teste que falha com o bug atual
public function test_does_not_allow_duplicate_payment_for_same_order(): void
{
    $order = Order::factory()->create(['status' => 'pending']);

    $this->postJson("/api/v1/orders/{$order->id}/pay", ['payment_method' => 'credit_card']);
    $response = $this->postJson("/api/v1/orders/{$order->id}/pay", ['payment_method' => 'credit_card']);

    $response->assertStatus(409);
    $this->assertEquals(1, $order->payments()->count());
}
```

### 6. Implementar a Correção

```
- Corrigir a CAUSA RAIZ, não o sintoma
- A correção deve ser mínima e focada
- Não misturar refatoração com a correção
- Verificar se o bug existe em locais similares
```

### 7. Validar

```
□ Teste criado agora passa
□ Todos os outros testes continuam passando
□ Testado manualmente o cenário do bug
□ Testado casos adjacentes que poderiam ser afetados
□ Sem regressão em outros módulos
```

### 8. Commit com Contexto

```bash
# Commit deve explicar o BUG e a CORREÇÃO
git commit -m "fix(orders): prevent duplicate payment on double click

Usuário poderia criar dois pagamentos para o mesmo pedido
ao clicar duas vezes rapidamente no botão de pagar.

Solução: adicionar verificação de pagamento pendente antes
de criar novo e usar lock optimista na tabela de pedidos.

Closes #234"
```

### 9. Pull Request e Deploy

```
□ PR com descrição do bug, causa raiz e correção
□ Review aprovado
□ Merge em develop (normal) ou main (hotfix)
□ Deploy em staging → validar
□ Deploy em produção (hotfix: imediato; bug normal: próximo release)
□ Monitorar após deploy
```

---

## Hotfix de Produção

Para bugs críticos em produção:

```bash
# Criar branch a partir de main
git checkout -b hotfix/critical-bug-description main

# Implementar correção mínima

# PR para main E develop
# Deploy imediato após aprovação
# Criar tag de versão
git tag -a v2.1.1 -m "hotfix: description"
```

---

## Checklist de Conclusão

```
[ ] Bug reproduzido antes de corrigir
[ ] Causa raiz identificada
[ ] Teste criado que falha com o bug
[ ] Correção implementada na causa raiz
[ ] Todos os testes passam
[ ] Deploy em staging verificado
[ ] Bug não volta a ocorrer após correção
```

---

*Template: my-fullstack-developer*
