"use client";

import { useAuth } from "@/hooks/useAuth";

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-8">
      <dt className="w-36 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="text-sm text-zinc-900 dark:text-white">{value}</dd>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Informações da sua conta
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Perfil
          </h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-0 divide-y divide-zinc-100 px-6 dark:divide-zinc-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-8 py-4">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : (
          <dl className="divide-y divide-zinc-100 px-6 dark:divide-zinc-800">
            <FieldRow label="Nome" value={user?.name ?? ""} />
            <FieldRow label="Usuário" value={`@${user?.username ?? ""}`} />
            <FieldRow label="E-mail" value={user?.email ?? ""} />
            <FieldRow
              label="Membro desde"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
            />
          </dl>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-600">
        Para alterar seus dados, entre em contato com o suporte.
      </p>
    </div>
  );
}
