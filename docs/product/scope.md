# Escopo do Projeto — TapFolio v1.0

**Data:** 2026-05
**Status:** ativo

---

## Personas

### Persona 1: Gabriel — Desenvolvedor / Criador de Conteúdo
```
Quem é: desenvolvedor fullstack, compartilha projetos e conteúdo técnico
Objetivo principal: ter uma página única com links para GitHub, LinkedIn, portfólio e projetos
Dores: cansa de atualizar múltiplas bio em múltiplas plataformas
Comportamento: acessa pelo mobile, compartilha o link na bio do Instagram
Critérios de sucesso: criar o perfil em menos de 5 minutos e compartilhar a URL
```

### Persona 2: Ana — Freelancer
```
Quem é: designer freelancer, atende clientes por WhatsApp e Instagram
Objetivo principal: centralizar portfólio, WhatsApp e redes em um único link
Dores: Linktree limita personalização de cores no plano gratuito
Comportamento: acessa o painel ocasionalmente para adicionar novos projetos
Critérios de sucesso: página com visual alinhado à sua identidade visual
```

---

## Requisitos Funcionais — v1.0

### Módulo: Autenticação
- [ ] RF001 — Usuário pode se cadastrar com nome, email, senha e username desejado
- [ ] RF002 — Usuário pode fazer login com email e senha
- [ ] RF003 — Usuário pode recuperar senha via email
- [ ] RF004 — Usuário pode fazer logout
- [ ] RF005 — Token JWT com refresh automático

### Módulo: Perfil
- [ ] RF010 — Usuário pode atualizar nome de exibição e bio
- [ ] RF011 — Usuário pode fazer upload de foto de perfil
- [ ] RF012 — Usuário pode escolher tema visual (light/dark + paleta de cores)
- [ ] RF013 — Perfil público acessível via `/:username`

### Módulo: Links
- [ ] RF020 — Usuário pode adicionar link com título e URL
- [ ] RF021 — Usuário pode editar título e URL de um link
- [ ] RF022 — Usuário pode reordenar links via drag-and-drop
- [ ] RF023 — Usuário pode ativar ou desativar um link sem excluí-lo
- [ ] RF024 — Usuário pode excluir um link
- [ ] RF025 — Limite inicial de 20 links por perfil

### Módulo: Analytics
- [ ] RF030 — Sistema registra cada clique em um link (timestamp, link_id)
- [ ] RF031 — Usuário pode ver total de cliques por link
- [ ] RF032 — Usuário pode ver cliques dos últimos 7, 30 e 90 dias

---

## Requisitos Não Funcionais

### Performance
- [ ] RNF001 — Endpoints da API devem responder em < 200ms (p95)
- [ ] RNF002 — Página pública deve ter LCP < 2.5s
- [ ] RNF003 — Página pública renderizada via SSG ou ISR (Next.js)

### Disponibilidade
- [ ] RNF004 — Uptime de 99.5% em horário comercial
- [ ] RNF005 — Health check no endpoint `/api/health`

### Segurança
- [ ] RNF006 — HTTPS obrigatório em todos os ambientes (exceto localhost)
- [ ] RNF007 — Senhas com bcrypt (fator ≥ 12)
- [ ] RNF008 — Rate limiting: 5 tentativas de login por 15 minutos por IP
- [ ] RNF009 — Uploads de imagem validados por tipo MIME e tamanho (máx 2MB)

### Escalabilidade
- [ ] RNF010 — Backend stateless (sessão via JWT, arquivos via S3/MinIO)
- [ ] RNF011 — Banco de dados com índices em campos de busca frequente

### Manutenibilidade
- [ ] RNF012 — Cobertura de testes > 70% no backend
- [ ] RNF013 — Documentação de API via Swagger/OpenAPI

---

## Escopo da Versão 1.0

### Incluso
- Cadastro, login e autenticação JWT
- Perfil público com foto, bio e tema
- CRUD de links com reordenação
- Analytics básico de cliques
- Painel de gerenciamento (dashboard)
- Docker para desenvolvimento e produção
- CI/CD via GitHub Actions
- Deploy em VPS Linux

### Excluído (pós-MVP)
- Domínio customizado por usuário
- Integração OAuth (Google, GitHub)
- Editor visual drag-and-drop
- Agendamento de links (ativo por período)
- Exportação de analytics (CSV)
- Planos pagos e monetização

---

## Critérios de Aceite Gerais

```
Para qualquer feature ser considerada concluída:
- [ ] Requisitos funcionais implementados
- [ ] Testes unitários e de integração criados
- [ ] Documentação de API atualizada no Swagger
- [ ] Code review aprovado
- [ ] Testado em ambiente local via Docker
- [ ] Sem vulnerabilidades críticas (npm audit / composer audit)
```

---

*Última atualização: 2026-05*
