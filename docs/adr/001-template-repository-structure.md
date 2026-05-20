# ADR-001: Estrutura do Template Repository

**Data:** 2026-05
**Status:** accepted
**Decisores:** Gabriel Muller

---

## Contexto

Projetos fullstack frequentemente começam sem estrutura definida de governança, documentação ou padrões. Isso leva a:

- Onboarding demorado de novos desenvolvedores (e agentes de IA)
- Inconsistência de padrões entre projetos da mesma empresa
- Falta de documentação de decisões arquiteturais
- Dificuldade de agentes de IA entenderem o contexto do projeto
- Retrabalho na definição de padrões a cada projeto novo

A necessidade é ter um template base que acelere o início de projetos profissionais com governança técnica de qualidade.

---

## Decisão

Criar um repositório template com a seguinte estrutura de governança:

1. **CLAUDE.md** — Regras de comportamento para agentes de IA
2. **AGENTS.md** — Guia de onboarding para agentes de IA
3. **.claude/commands/** — Comandos reutilizáveis para tarefas comuns
4. **.claude/skills/** — Especialidades por domínio técnico
5. **.claude/rules/** — Regras por stack e contexto
6. **docs/** — Documentação completa de arquitetura, convenções e workflows
7. **templates/** — Templates reutilizáveis para documentos
8. **scripts/** — Scripts de automação e verificação

---

## Justificativa

Esta estrutura foi escolhida porque:

1. **Compatibilidade com múltiplos agentes**: CLAUDE.md é lido pelo Claude Code nativamente; AGENTS.md é lido pelo Windsurf; ambos funcionam como contexto para Cursor, Copilot e Aider.

2. **Escalabilidade**: Commands e Skills permitem adicionar novas capacidades sem modificar a estrutura core.

3. **Padrão de mercado**: Estrutura similar ao que empresas como Stripe, GitHub e Vercel usam internamente para documentação técnica.

4. **Orientado a IA**: A estrutura permite que agentes de IA entendam rapidamente o projeto, reduzindo o tempo de "onboarding" de agentes.

---

## Alternativas Consideradas

### Opção A: README apenas — ❌ Descartada
**Por quê descartada:** Um README único não escala para projetos grandes. Não há separação por tipo de informação (arquitetura, convenções, workflows).

### Opção B: Wiki do GitHub — ❌ Descartada
**Por quê descartada:** Wiki não faz parte do repositório (clone separado). Agentes de IA não têm acesso direto ao wiki. Documentação separada do código tende a ficar desatualizada.

### Opção C: Estrutura de docs/ com CLAUDE.md — ✅ Escolhida
**Por quê escolhida:** Documentação no repositório (versionada com o código), compatível com múltiplos agentes de IA, estrutura clara e extensível.

---

## Consequências

### Positivas
- Onboarding de novos devs e agentes de IA reduzido de dias para horas
- Padrões consistentes entre projetos derivados
- Decisões arquiteturais rastreáveis via ADRs
- Commands e Skills extensíveis sem modificar core

### Negativas / Trade-offs
- Overhead inicial de manutenção da documentação
- Repositório maior que o necessário para projetos simples
- Risco de documentação ficar desatualizada se não houver disciplina

### Neutras
- Requer familiaridade com Markdown para criar e editar docs
- A estrutura é uma sugestão — projetos podem adaptar conforme necessário

---

## Revisão

**Revisar se:** A estrutura de agentes de IA (como Claude Code) mudar significativamente suas convenções de arquivos.
**Próximo review:** 2027-01

---

*ADR criado com base no template my-fullstack-developer*
