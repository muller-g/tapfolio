# Gerenciamento de Estado — Frontend

## Categorias de Estado

Antes de escolher uma solução, identifique qual categoria de estado você está gerenciando:

| Categoria | Onde vive | Exemplos | Solução |
|-----------|-----------|----------|---------|
| **Servidor** | Banco de dados | Listas, entidades, dados paginados | React Query / SWR / Pinia |
| **UI** | Componente | Modal aberto, aba ativa, hover | `useState` / `ref` local |
| **URL** | Endereço | Filtros, busca, paginação | `useSearchParams` / `$route.query` |
| **Global** | App | Usuário logado, tema, notificações | Zustand / Pinia / Context |
| **Formulário** | Form | Campos, validação, submit | React Hook Form / VeeValidate |

---

## Regra de Ouro

> **Coloque o estado o mais perto possível de onde ele é usado.**

Não crie store global para estado que só um componente usa. Não use `useState` para dados do servidor.

---

## Estado de Servidor — React Query

### Configuração

```typescript
// app/providers.tsx (Next.js) ou main.tsx (React)
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,       // 1 minuto — dados considerados frescos
        gcTime: 1000 * 60 * 5,      // 5 minutos — manter em cache após desmount
        retry: 1,                    // Tentar 1x após falha
        refetchOnWindowFocus: false, // Não rebuscar ao focar janela
      },
      mutations: {
        retry: 0,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### Padrões de Query

```typescript
// hooks/use-orders.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { OrderFilters, CreateOrderDto } from '@/types/order';

// Query keys centralizadas — evita typos e facilita invalidação
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

// Query com paginação e filtros
export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => orderService.list(filters),
    placeholderData: keepPreviousData,  // Mantém dados anteriores durante paginação
    staleTime: 1000 * 30,              // 30 segundos para listas
  });
}

// Query única
export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.findById(id),
    enabled: id > 0,
    staleTime: 1000 * 60 * 5,          // 5 minutos para entidade individual
  });
}

// Mutation com otimistic update
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderService.cancel(orderId),
    onMutate: async (orderId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });

      // Snapshot do estado anterior
      const previousOrder = queryClient.getQueryData(orderKeys.detail(orderId));

      // Optimistic update
      queryClient.setQueryData(orderKeys.detail(orderId), (old: Order) => ({
        ...old,
        status: 'cancelled',
      }));

      return { previousOrder };
    },
    onError: (_error, orderId, context) => {
      // Reverter em caso de erro
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(orderId), context.previousOrder);
      }
    },
    onSettled: (_, __, orderId) => {
      // Sempre rebuscar após mutation
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
```

---

## Estado Global — Zustand (React)

Use apenas para estado que realmente precisa ser compartilhado globalmente: usuário autenticado, tema, notificações, configurações.

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
```

### Store de Notificações (UI global)

```typescript
// stores/notification.store.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  add: (notification) => {
    const id = nanoid();
    const duration = notification.duration ?? 5000;

    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  remove: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),

  clear: () => set({ notifications: [] }),
}));

// Hook de conveniência
export function useNotify() {
  const { add } = useNotificationStore();
  return {
    success: (title: string, message?: string) => add({ type: 'success', title, message }),
    error: (title: string, message?: string) => add({ type: 'error', title, message }),
    warning: (title: string, message?: string) => add({ type: 'warning', title, message }),
    info: (title: string, message?: string) => add({ type: 'info', title, message }),
  };
}
```

---

## Estado de URL — Filtros e Paginação

Filtros e paginação devem viver na URL para que links sejam compartilháveis e o histórico funcione.

```typescript
// hooks/use-order-filters.ts (Next.js App Router)
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface OrderFilters {
  status?: string;
  page?: number;
  search?: string;
}

export function useOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: OrderFilters = {
    status: searchParams.get('status') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    search: searchParams.get('search') ?? undefined,
  };

  const setFilter = useCallback((key: keyof OrderFilters, value: string | number | undefined) => {
    const params = new URLSearchParams(searchParams);

    if (value === undefined || value === '' || value === 1) {
      params.delete(String(key));
    } else {
      params.set(String(key), String(value));
    }

    // Reset page ao mudar filtro
    if (key !== 'page') {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { filters, setFilter, resetFilters };
}
```

---

## Decisão: Quando Usar Cada Solução

```
Dados do servidor?
  → Sim → React Query / SWR / Pinia fetch composable
  → Não ↓

Precisa persistir na URL?
  → Sim → useSearchParams / $route.query
  → Não ↓

Compartilhado entre componentes não-relacionados?
  → Sim → Zustand / Pinia store
  → Não ↓

Estado de formulário?
  → Sim → React Hook Form / VeeValidate
  → Não ↓

Estado local do componente
  → useState / ref
```
