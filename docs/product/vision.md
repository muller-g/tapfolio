# Visão do Produto — TapFolio

**Data:** 2026-05
**Status:** ativo

---

## Declaração de Visão

**Para** criadores de conteúdo, desenvolvedores, freelancers e profissionais
**que** precisam compartilhar múltiplos links e canais em um único lugar
**o** TapFolio
**é** uma plataforma de página de perfil com links centralizados
**que** permite criar, personalizar e compartilhar uma página única com todos os seus links importantes
**diferente de** Linktree e similares (que cobram por personalização básica ou limitam funcionalidades no plano gratuito)
**nosso produto** é open source, auto-hospedável e com personalização completa sem barreiras de paywall

---

## Problema que Resolve

A fragmentação de presença digital é uma realidade: Instagram, GitHub, LinkedIn, portfólio, WhatsApp, loja, cursos, projetos — cada um em um lugar diferente.

- **Dor do usuário:** compartilhar 8 links diferentes em 8 bio diferentes, perder cliques e oportunidades
- **Alternativa atual:** Linktree, Beacons, Milkshake — todos com limitações no plano gratuito
- **Por que não resolvem:** cobram por Analytics, personalização de temas e domínio customizado

---

## Proposta de Valor

| Stakeholder | Valor entregue |
|---|---|
| Usuário final | Uma URL pra compartilhar tudo, sem limite de links, com tema personalizado |
| Criador de conteúdo | Analytics de cliques para entender de onde vem o tráfego |
| Desenvolvedor | Projeto moderno e bem documentado para estudar arquitetura fullstack |

---

## Funcionalidades Principais

1. **Perfil personalizado** — foto, bio, nome de usuário e tema de cores
2. **Lista de links** — adicionar, reordenar, ativar/desativar links
3. **Analytics de cliques** — quantos cliques cada link recebeu
4. **Temas visuais** — temas prontos + personalização de cores
5. **Responsividade total** — mobile-first, funciona em qualquer dispositivo
6. **Compartilhamento fácil** — URL pública no formato `tapfolio.app/username`

---

## Restrições e Premissas

```
Restrições:
- Projeto de estudo com foco em qualidade de código e arquitetura
- Deploy em VPS Linux com Docker (sem Kubernetes)
- PostgreSQL como único banco de dados

Premissas:
- Usuários têm email e senha para autenticação
- O username é único e imutável após criação
- Cada usuário tem exatamente um perfil público
```

---

*Última atualização: 2026-05*
