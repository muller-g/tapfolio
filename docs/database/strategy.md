# Estratégia de Banco de Dados

Abordagem de design, migração e manutenção de banco de dados.

---

## Banco Principal

```
Recomendação: PostgreSQL 16+
Alternativa: MySQL 8.0+

PostgreSQL preferido por:
  - Suporte nativo a JSON/JSONB
  - ENUM mais flexível
  - Full-text search nativo
  - Tipos de dados avançados (UUID, arrays)
  - Melhor tratamento de concorrência
  - pg_stat_activity para monitoramento de queries
```

---

## Padrões de Schema

### Campos Obrigatórios
```sql
-- Toda tabela de entidade deve ter:
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at  TIMESTAMP NULL  -- soft delete (entidades de negócio)
```

### Tipos de Dados
```
Texto curto:   VARCHAR(255)
Texto longo:   TEXT
Inteiro:       INT ou BIGINT (para IDs)
Decimal:       DECIMAL(10,2)  — NUNCA float para dinheiro
Boolean:       TINYINT(1) ou BOOLEAN
Enum:          ENUM ou VARCHAR com check constraint
JSON:          JSON ou JSONB
UUID:          CHAR(36) ou UUID nativo
Data:          DATE
Datetime:      TIMESTAMP
```

---

## Estratégia de Migrations

```
Princípios:
  - Toda migration tem down() funcional
  - Migrations são atômicas e reversíveis
  - Migrations não contêm lógica de negócio
  - Dados migrados em scripts separados
  - Colunas novas: nullable ou com default (tabelas com dados)

Sequência segura de mudança de schema:
  1. Adicionar nova coluna nullable
  2. Preencher dados na nova coluna (script separado)
  3. Adicionar NOT NULL constraint (se necessário)
  4. Remover coluna antiga (depois de validar)
```

---

## Estratégia de Índices

```
Obrigatórios:
  - PK em toda tabela
  - FK com índice obrigatório
  - UNIQUE em campos únicos (email, cpf, slug)

Recomendados:
  - Campos de filtro frequente (status, type, is_active)
  - Campos de ordenação frequente (created_at, name)
  - Campos de busca (name, title — para LIKE 'X%')

Compostos (para queries específicas):
  - (user_id, created_at) — histórico por usuário
  - (status, created_at) — filtro + ordenação

Verificar uso:
  EXPLAIN SELECT ... para verificar se índice está sendo usado
  SHOW INDEX FROM tabela para listar índices
```

---

## Backup e Recovery

```
Frequência:
  - Full backup: diário (03:00)
  - Incremental: a cada 6 horas
  - WAL/binlog: contínuo (para PITR)

Retenção:
  - Diários: 7 dias
  - Semanais: 4 semanas
  - Mensais: 12 meses

Teste de restauração:
  - Mensal: restaurar backup em ambiente isolado
  - Validar integridade dos dados

Localização:
  - Nunca no mesmo servidor da aplicação
  - Preferencialmente em região geográfica diferente
  - Criptografado em repouso
```

---

## Monitoramento

```
Métricas a monitorar:
  - Queries lentas (> 100ms)
  - Conexões ativas vs pool size
  - Uso de disco (alertar em 70%)
  - Tamanho de tabelas que crescem rapidamente
  - Locks e deadlocks
  - Replication lag (se com réplica)
```

---

*Versão: 1.0.0 — 2026-05*
