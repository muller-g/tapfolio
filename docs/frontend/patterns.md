# Padrões de Frontend

## Filosofia

Frontend moderno segue três princípios centrais:
1. **Server-first** — renderize no servidor sempre que possível (Next.js App Router)
2. **Composição** — componentes pequenos, reutilizáveis e testáveis
3. **Tipagem estrita** — TypeScript sem `any`, props tipadas, APIs validadas

---

## Estrutura de Componentes

### Hierarquia

```
pages / app/          → Rotas e layouts (sem lógica de negócio)
components/
  ui/                 → Componentes genéricos (Button, Input, Modal)
  features/           → Componentes específicos de domínio (UserCard, OrderList)
  layouts/            → Layouts compartilhados (Header, Sidebar, Footer)
hooks/                → Lógica reutilizável com React hooks
stores/               → Estado global (Zustand / Pinia)
services/             → Chamadas de API (axios, fetch)
utils/                → Funções puras utilitárias
types/                → Interfaces e tipos TypeScript
```

---

## React / Next.js

### Server Components (padrão)

```tsx
// app/users/page.tsx — Server Component
import { getUserList } from '@/services/user.service';
import { UserList } from '@/components/features/UserList';

export const metadata = {
  title: 'Usuários | App',
  description: 'Gerenciamento de usuários',
};

export default async function UsersPage() {
  // Fetch diretamente no servidor — sem loading state, sem useEffect
  const users = await getUserList();

  return (
    <main>
      <h1>Usuários</h1>
      <UserList users={users} />
    </main>
  );
}
```

### Client Components — apenas quando necessário

```tsx
// components/features/UserSearch.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface UserSearchProps {
  initialQuery: string;
}

export function UserSearch({ initialQuery }: UserSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = (value: string) => {
    setQuery(value);
    startTransition(() => {
      router.push(`/users?q=${encodeURIComponent(value)}`);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar usuários..."
        aria-label="Buscar usuários"
        disabled={isPending}
      />
      {isPending && <span aria-live="polite">Buscando...</span>}
    </div>
  );
}
```

### Componente Completo com Todos os Estados

```tsx
// components/features/UserCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { User } from '@/types/user';

interface UserCardProps {
  userId: number;
}

export function UserCard({ userId }: UserCardProps) {
  const { data: user, isLoading, error, refetch } = useUser(userId);

  if (isLoading) {
    return <UserCardSkeleton />;  // Skeleton, não spinner genérico
  }

  if (error) {
    return (
      <div role="alert">
        <p>Erro ao carregar usuário.</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  if (!user) {
    return <p>Usuário não encontrado.</p>;
  }

  return (
    <article>
      <Image
        src={user.avatar}
        alt={`Foto de ${user.name}`}
        width={64}
        height={64}
      />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </article>
  );
}
```

---

## Hooks Customizados

```typescript
// hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User, UpdateUserDto } from '@/types/user';

export function useUser(userId: number) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userService.findById(userId),
    staleTime: 1000 * 60 * 5,  // 5 minutos
    enabled: !!userId,
  });
}

export function useUpdateUser(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => userService.update(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users', userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

## Formulários com React Hook Form

```tsx
// components/features/CreateUserForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '@/hooks/use-user';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function CreateUserForm() {
  const { mutate: createUser, isPending, isError, error } = useCreateUser();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    createUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name">Nome</label>
        <input id="name" {...register('name')} aria-describedby="name-error" />
        {errors.name && (
          <span id="name-error" role="alert">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <span role="alert">{errors.email.message}</span>}
      </div>

      {isError && (
        <div role="alert">
          Erro ao criar usuário: {error?.message}
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Usuário'}
      </button>
    </form>
  );
}
```

---

## Vue.js 3 — Composition API

```vue
<!-- components/features/UserCard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { User } from '@/types/user';

interface Props {
  userId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  edit: [user: User];
  delete: [userId: number];
}>();

const store = useUserStore();
const user = computed(() => store.findById(props.userId));
const isLoading = computed(() => store.isLoading);

async function handleDelete() {
  if (!user.value) return;
  await store.delete(props.userId);
  emit('delete', props.userId);
}
</script>

<template>
  <article v-if="isLoading" aria-busy="true">
    <UserCardSkeleton />
  </article>

  <article v-else-if="user">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
    <button @click="emit('edit', user)" :aria-label="`Editar ${user.name}`">
      Editar
    </button>
    <button @click="handleDelete" :aria-label="`Excluir ${user.name}`">
      Excluir
    </button>
  </article>

  <p v-else>Usuário não encontrado.</p>
</template>
```

### Pinia Store

```typescript
// stores/user.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from '@/services/user.service';
import type { User } from '@/types/user';

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const findById = computed(() => (id: number) =>
    users.value.find((u) => u.id === id) ?? null
  );

  async function fetchAll(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      users.value = await userService.list();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro desconhecido';
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: number): Promise<void> {
    await userService.delete(id);
    users.value = users.value.filter((u) => u.id !== id);
  }

  return { users, isLoading, error, findById, fetchAll, deleteUser };
});
```

---

## Acessibilidade — Obrigatório

- Todo elemento interativo tem `aria-label` ou texto visível
- Formulários com `<label>` associado via `htmlFor` / `for`
- Erros com `role="alert"` ou `aria-live="polite"`
- Imagens com `alt` descritivo (nunca vazio em imagens informativas)
- Navegação por teclado funcional
- Contraste mínimo WCAG AA (4.5:1 texto normal, 3:1 texto grande)

---

## Regras PROIBIDAS

```
❌ useEffect para buscar dados (use React Query / SWR / composables)
❌ <img> sem next/image em projetos Next.js
❌ any em TypeScript
❌ Estado global para dados que pertencem ao servidor
❌ Lógica de negócio em componentes — extraia para hooks/stores
❌ Componentes com mais de 150 linhas — divida
❌ Props drilling além de 2 níveis — use Context ou store
```
