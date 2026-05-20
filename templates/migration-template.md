# Migration: [descrição do que faz]

**Data:** [YYYY-MM-DD]
**Autor:** [nome]
**Tipo:** [create-table | add-column | modify-column | add-index | drop]
**Reversível:** [sim | sim com ressalvas | não]
**Impacto:** [sem dados existentes | tem dados existentes — cuidado]

---

## Contexto

[Por que esta migration é necessária? Qual feature ou correção motivou?]

---

## Schema

### Laravel

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('table_name', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict');

            $table->index('status');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('table_name');
    }
};
```

### TypeORM

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTableName1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'table_name',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'name', type: 'varchar', length: '255' },
                    { name: 'status', type: 'enum', enum: ['active', 'inactive'], default: "'active'" },
                    { name: 'user_id', type: 'int' },
                    { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
                ],
            }),
        );

        await queryRunner.createForeignKey('table_name', new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
        }));

        await queryRunner.createIndex('table_name', new TableIndex({
            columnNames: ['user_id'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('table_name');
    }
}
```

---

## Campos Criados

| Campo | Tipo | Nullable | Default | Índice | Descrição |
|---|---|---|---|---|---|
| `id` | BIGINT | não | auto | PK | Identificador |
| `name` | VARCHAR(255) | não | — | — | Nome |
| `status` | ENUM | não | active | sim | Status |
| `user_id` | BIGINT | não | — | FK | Referência ao usuário |

---

## Considerações de Segurança

```
[ ] Colunas novas são nullable ou tem default (tabela pode ter dados)
[ ] down() desfaz completamente o up()
[ ] FK com ON DELETE correto
[ ] Índices necessários criados
[ ] DECIMAL para valores monetários (não float)
```

---

## Como Executar

```bash
# Laravel
php artisan migrate
php artisan migrate:rollback  # reverter

# TypeORM
npm run typeorm migration:run
npm run typeorm migration:revert

# Prisma
npx prisma migrate dev
npx prisma migrate reset  # reverter (dev apenas)
```

---

*Template: my-fullstack-developer*
