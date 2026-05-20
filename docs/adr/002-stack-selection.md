# ADR-002: Seleção de Stack — Laravel + Next.js + PostgreSQL

**Data:** 2026-05
**Status:** accepted
**Decisores:** Gabriel Muller

---

## Contexto

O TapFolio é um projeto fullstack de estudo com foco em arquitetura de qualidade. A escolha da stack precisa equilibrar:

- Produtividade de desenvolvimento (para um desenvolvedor solo)
- Boas práticas de arquitetura (objetivo de estudo)
- SEO e performance para páginas públicas de perfil
- Custo de infraestrutura (VPS + Docker, sem serviços managed caros)

---

## Decisão

**Backend:** Laravel 11 (PHP 8.3)
**Frontend:** Next.js 14 com App Router (TypeScript)
**Banco:** PostgreSQL 16
**Cache/Filas:** Redis 7
**Containers:** Docker + Compose
**Proxy:** Nginx

---

## Alternativas Consideradas

### Opção A: NestJS + Next.js (TypeScript fullstack)
**Prós:** TypeScript em toda a stack, compartilhamento de tipos, ecossistema unificado
**Contras:** NestJS tem curva de aprendizado maior; Laravel oferece mais recursos out-of-the-box (Sanctum, Queues, Jobs)

### Opção B: Laravel + Vue.js (Inertia.js)
**Prós:** integração nativa via Inertia, DX excelente para apps monolíticos
**Contras:** Inertia não oferece SSG — páginas de perfil público precisam de SSR full ou SSG para SEO

### Opção C (escolhida): Laravel + Next.js (API separada)
**Prós:** Laravel maduro para API REST, Next.js com SSG nativo para perfis públicos
**Contras:** dois repositórios/serviços para manter; mais configuração inicial

---

## Justificativas

**Laravel:** ecossistema maduro, Sanctum para autenticação JWT sem configuração extra, Eloquent ORM com factories para testes, queues nativas para registrar cliques de forma assíncrona.

**Next.js App Router:** SSG/ISR para páginas de perfil público (critical path para SEO e performance), Server Components para reduzir JS no cliente, Server Actions para formulários.

**PostgreSQL:** suporte nativo a JSON, melhor performance em leituras concorrentes, sem custo adicional em VPS.

**Redis:** driver nativo de cache e queues do Laravel, rate limiting sem biblioteca extra.

**Docker:** padronização de ambiente dev → staging → prod, sem "funciona na minha máquina".

---

## Consequências

**Positivas:**
- Perfis públicos gerados estaticamente → LCP < 1.5s mesmo sem CDN
- API RESTful desacoplada → frontend pode ser trocado sem impacto no backend
- Laravel Jobs para registrar cliques de forma assíncrona → sem latência na rota de clique

**Negativas:**
- Dois projetos separados para configurar e manter
- CORS precisa ser configurado explicitamente no Laravel
- Deploy precisa orquestrar dois containers de aplicação + banco + redis + nginx

---

*Última atualização: 2026-05*
