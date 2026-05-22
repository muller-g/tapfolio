"use client";

import { useEffect, useState } from "react";
import { MetricsService } from "@/services/metrics.service";
import type { MetricsData, LinkMetric } from "@/types/metrics";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  spotify: "Spotify",
  github: "GitHub",
};

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, icon }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

// ─── Link Metrics Card ────────────────────────────────────────────────────────

function LinkMetricCard({ link }: { link: LinkMetric }) {
  const hasSubLinks = link.sub_links.length > 0;
  const hasSocial   = link.social.length > 0;
  const maxClicks   = Math.max(...link.sub_links.map((l) => l.clicks), ...link.social.map((s) => s.clicks), 1);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Link header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`size-2 rounded-full ${link.is_active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{link.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{link.views} visitas</span>
          <span className="font-semibold text-zinc-900 dark:text-white">{link.total_clicks} cliques</span>
        </div>
      </div>

      {!hasSubLinks && !hasSocial && (
        <p className="px-5 py-6 text-sm text-zinc-400 dark:text-zinc-500">
          Nenhum botão configurado neste link ainda.
        </p>
      )}

      {/* Sub-link buttons */}
      {hasSubLinks && (
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Botões
          </p>
          <ul className="space-y-2.5">
            {link.sub_links.map((sl) => (
              <li key={sl.button_key} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{sl.label}</span>
                    <span className="ml-2 shrink-0 text-sm font-semibold text-zinc-900 dark:text-white">{sl.clicks}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-700"
                      style={{ width: `${(sl.clicks / maxClicks) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Social clicks */}
      {hasSocial && (
        <div className={`px-5 py-4 ${hasSubLinks ? "border-t border-zinc-100 dark:border-zinc-800" : ""}`}>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Redes sociais
          </p>
          <ul className="space-y-2.5">
            {link.social.map((s) => (
              <li key={s.platform} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {SOCIAL_LABELS[s.platform] ?? s.platform}
                    </span>
                    <span className="ml-2 text-sm font-semibold text-zinc-900 dark:text-white">{s.clicks}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-700"
                      style={{ width: `${(s.clicks / maxClicks) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <svg className="mx-auto size-10 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
      <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Nenhuma métrica ainda
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        Compartilhe seu perfil para começar a coletar dados.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MetricsPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MetricsService.getMetrics()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.message !== "UNAUTHORIZED") setError("Erro ao carregar métricas.");
        setLoading(false);
      });
  }, []);

  const summary = data?.summary;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Métricas
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Cliques por botão e rede social em cada link
        </p>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total de visitas"
          value={loading ? "—" : (summary?.total_views ?? 0).toLocaleString("pt-BR")}
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
        />
        <SummaryCard
          label="Total de cliques"
          value={loading ? "—" : (summary?.total_clicks ?? 0).toLocaleString("pt-BR")}
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
            </svg>
          }
        />
        <SummaryCard
          label="Taxa de cliques (CTR)"
          value={loading ? "—" : `${summary?.ctr ?? 0}%`}
          sub="cliques / visitas"
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          }
        />
      </div>

      {/* Per-link breakdown */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      )}

      {!loading && data && (
        data.links.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {data.links.map((link) => (
              <LinkMetricCard key={link.id} link={link} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
