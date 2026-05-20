# Workflow: Onboarding de Desenvolvedor

Guia completo para integrar um novo desenvolvedor ao projeto.

---

## Dia 1: Entendimento e Setup

### Leitura Obrigatória
```
□ README.md — visão geral e como usar
□ CLAUDE.md — regras de desenvolvimento
□ docs/architecture/overview.md — arquitetura do sistema
□ docs/conventions/ — nomenclatura, git, commits
□ docs/product/vision.md — contexto do produto
```

### Setup do Ambiente Local
```bash
# 1. Clonar o repositório
git clone https://github.com/org/projeto.git
cd projeto

# 2. Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com valores de desenvolvimento

# 3. Executar script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Verificar se tudo está ok
./scripts/doctor.sh
```

### Verificações de Setup
```
□ Aplicação rodando em localhost
□ Banco de dados criado e migrations executadas
□ Testes passando
□ Acesso ao repositório e branches
□ Acesso aos ambientes (staging, produção — somente leitura)
□ Ferramentas de desenvolvimento instaladas (ver docs/tooling.md)
```

---

## Dia 2-3: Exploração do Código

### Exploração Guiada
```
□ Executar /analyze-codebase para mapa do código
□ Ler os principais modules/controllers
□ Entender o fluxo de autenticação
□ Entender o módulo principal do negócio
□ Ler os testes existentes para entender comportamentos
□ Verificar docs/adr/ para entender decisões passadas
```

### Primeira Contribuição (Bug Pequeno ou Melhoria)
```
□ Pegar uma task pequena (good first issue)
□ Criar branch seguindo as convenções
□ Implementar com os padrões do projeto
□ Criar PR seguindo o template
□ Passar pelo processo de review
□ Mergear após aprovação
```

---

## Semana 1: Primeiras Features

### Expectativas
```
- Entender o ciclo completo: feature → PR → review → staging → produção
- Participar de pelo menos 1 code review (como revisor)
- Criar pelo menos 1 ADR (mesmo que pequeno)
- Ter dúvidas — perguntar é esperado e encorajado
```

### Recursos de Apoio
```
□ .claude/commands/ — comandos para tarefas comuns
□ .claude/skills/ — guias especializados por stack
□ docs/workflows/ — fluxos passo a passo
□ templates/ — templates para documentos
□ Pair programming com dev experiente do time
```

---

## Checklist de Onboarding Completo

### Técnico
```
□ Ambiente local configurado e funcionando
□ Código explorado e entendido (pelo menos módulos principais)
□ Primeira PR mergeada
□ Participou de um code review
□ Criou um ADR
□ Fez um deploy em staging
```

### Processo
```
□ Entende o fluxo de Git (branches, PRs, reviews)
□ Sabe usar os comandos Claude (/create-feature, etc.)
□ Entende as regras de segurança
□ Conhece os contatos do time
□ Tem acesso a todos os sistemas necessários
```

### Conhecimento
```
□ Entende a arquitetura geral
□ Conhece as principais regras de negócio
□ Entende a estratégia de testes
□ Sabe como fazer debug em cada ambiente
□ Sabe o processo de deploy
```

---

## Para o Tech Lead: Facilitando o Onboarding

```
□ README.md atualizado com setup passo a passo
□ .env.example com todas as variáveis necessárias
□ scripts/setup.sh funcionando
□ scripts/doctor.sh verificando o ambiente
□ Documentação de arquitetura atualizada
□ Task de "good first issue" reservada para novos devs
□ Par de onboarding designado (buddy system)
□ Reunião de apresentação do time e do produto
```

---

*Template: my-fullstack-developer*
