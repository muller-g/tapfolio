# Escopo do Projeto

> Define o que está dentro e fora do escopo, personas e requisitos.
> Adapte para o contexto específico do seu projeto.

---

## Personas

### Persona 1: [Nome] — [Perfil]
```
Quem é: [cargo, empresa, contexto]
Objetivo principal: [o que quer alcançar com o produto]
Dores: [frustrações com a solução atual]
Comportamento: [como usa tecnologia, frequência de uso]
Critérios de sucesso: [o que o faz dizer "funciona"]
```

### Persona 2: [Nome] — [Perfil]
```
[mesma estrutura]
```

---

## Requisitos Funcionais

### Módulo: Autenticação
- [ ] RF001 — Usuário pode se cadastrar com nome, email e senha
- [ ] RF002 — Usuário pode fazer login com email e senha
- [ ] RF003 — Usuário pode recuperar senha via email
- [ ] RF004 — Usuário pode fazer logout
- [ ] RF005 — Administrador pode criar e desativar usuários

### Módulo: [Módulo Principal]
- [ ] RF010 — [requisito funcional]
- [ ] RF011 — [requisito funcional]

---

## Requisitos Não Funcionais

### Performance
- [ ] RNF001 — Endpoints críticos devem responder em < 200ms (p95)
- [ ] RNF002 — Página inicial deve ter LCP < 2.5s
- [ ] RNF003 — Sistema deve suportar X usuários simultâneos

### Disponibilidade
- [ ] RNF004 — Uptime de 99.5% (horário comercial)
- [ ] RNF005 — Tempo de recuperação após falha < 5 minutos

### Segurança
- [ ] RNF006 — Dados de usuário criptografados em repouso
- [ ] RNF007 — HTTPS obrigatório em todos os ambientes
- [ ] RNF008 — Senha deve ter mínimo 8 caracteres com complexidade
- [ ] RNF009 — Rate limiting: máximo 5 tentativas de login por 15 minutos

### Escalabilidade
- [ ] RNF010 — Arquitetura deve permitir escalonamento horizontal
- [ ] RNF011 — Banco de dados deve suportar particionamento futuro

### Acessibilidade
- [ ] RNF012 — Interface deve seguir WCAG 2.1 nível AA

### Manutenibilidade
- [ ] RNF013 — Cobertura de testes > 70%
- [ ] RNF014 — Documentação de API atualizada a cada release

---

## Escopo da Versão 1.0

### Incluso
- [feature 1]
- [feature 2]
- [feature 3]

### Excluído (MVP)
- [feature futura 1]
- [feature futura 2]

---

## Critérios de Aceite Gerais

```
Para qualquer feature ser considerada concluída:
- [ ] Todos os requisitos funcionais implementados
- [ ] Testes unitários e de integração criados
- [ ] Documentação de API atualizada
- [ ] Code review aprovado
- [ ] Testado em staging
- [ ] Sem vulnerabilidades críticas
```

---

*Última atualização: 2026-05*
