"use client";

import { useEffect, useState } from "react";
import { DashboardService } from "@/services/dashboard.service";
import type { DashboardData, DayActivity, TopLink } from "@/types/dashboard";

type Period = 7 | 30 | 90;

// ─── Stats Card ──────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}

function StatsCard({ label, value, sub, icon }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
      )}
    </div>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

function WeeklyChart({ data }: { data: DayActivity[] }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.clicks, d.views)), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Atividade — últimos 7 dias
        </h2>
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-zinc-900 dark:bg-white" />
            Cliques
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
            Visitas
          </span>
        </div>
      </div>

      <div className="flex h-40 items-end gap-2">
        {data.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end gap-0.5">
              {/* views bar */}
              <div
                className="w-full rounded-t-sm bg-zinc-200 dark:bg-zinc-700 transition-all duration-500"
                style={{ height: `${(day.views / maxValue) * 100}%`, minHeight: day.views > 0 ? "4px" : "0" }}
                title={`${day.views} visitas`}
              />
              {/* clicks bar */}
              <div
                className="w-full rounded-t-sm bg-zinc-900 dark:bg-white transition-all duration-500"
                style={{ height: `${(day.clicks / maxValue) * 100}%`, minHeight: day.clicks > 0 ? "4px" : "0" }}
                title={`${day.clicks} cliques`}
              />
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Links Table ──────────────────────────────────────────────────────────

function LinkClicksTable({ links }: { links: TopLink[] }) {
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <svg className="mx-auto size-10 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
        <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Nenhum link criado ainda
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Adicione links para começar a ver os cliques aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Desempenho por link
        </h2>
      </div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800" role="list">
        {links.map((link) => (
          <li key={link.id} className="flex items-center gap-4 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                {link.title}
              </p>
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {link.url}
              </p>
              {/* progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-700"
                  style={{ width: `${link.percentage}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {link.clicks}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {link.percentage}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Device Breakdown ─────────────────────────────────────────────────────────

function DeviceBreakdown({ mobile, desktop, mobile_percent, desktop_percent }: {
  mobile: number;
  desktop: number;
  mobile_percent: number;
  desktop_percent: number;
}) {
  const total = mobile + desktop;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
        Dispositivos
      </h2>

      {total === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Sem dados ainda.</p>
      ) : (
        <div className="space-y-4">
          {/* Stacked bar */}
          <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-zinc-900 dark:bg-white transition-all duration-700"
              style={{ width: `${mobile_percent}%` }}
              title={`Mobile: ${mobile_percent}%`}
            />
            <div
              className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-700"
              style={{ width: `${desktop_percent}%` }}
              title={`Desktop: ${desktop_percent}%`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center">
                  <svg className="size-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                  </svg>
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Mobile</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{mobile_percent}%</span>
                <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">({mobile})</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center">
                  <svg className="size-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                  </svg>
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Desktop</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{desktop_percent}%</span>
                <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">({desktop})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Period Selector ──────────────────────────────────────────────────────────

const PERIODS: { value: Period; label: string }[] = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<Period>(30);
  const [error, setError] = useState("");

  // Derived: loading when there's no error and data hasn't been loaded for the current period yet
  const isLoading = !error && (!data || data.stats.period_days !== period);

  useEffect(() => {
    let cancelled = false;

    DashboardService.getStats(period)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setError("");
        }
      })
      .catch((err: Error) => {
        if (!cancelled && err.message !== "UNAUTHORIZED") {
          setError("Erro ao carregar dados. Tente novamente.");
        }
      });

    return () => { cancelled = true; };
  }, [period]);

  const stats = data?.stats;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Visão Geral
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Acompanhe o desempenho dos seus links
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === value
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Visitas ao perfil"
          value={isLoading ? "—" : (stats?.recent_views ?? 0).toLocaleString("pt-BR")}
          sub={`${stats?.total_views ?? 0} no total`}
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
        />
        <StatsCard
          label="Cliques totais"
          value={isLoading ? "—" : (stats?.recent_clicks ?? 0).toLocaleString("pt-BR")}
          sub={`${stats?.total_clicks ?? 0} no total`}
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
            </svg>
          }
        />
        <StatsCard
          label="Taxa de cliques"
          value={isLoading ? "—" : `${stats?.ctr ?? 0}%`}
          sub="cliques / visitas"
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          }
        />
        <StatsCard
          label="Links ativos"
          value={isLoading ? "—" : stats?.active_links ?? 0}
          sub={`nos últimos ${period} dias`}
          icon={
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          }
        />
      </div>

      {/* Weekly chart */}
      {data && <div className="mb-6"><WeeklyChart data={data.weekly_activity} /></div>}

      {/* Bottom grid: links table + devices */}
      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LinkClicksTable links={data.top_links} />
          </div>
          <DeviceBreakdown
            mobile={data.devices.mobile}
            desktop={data.devices.desktop}
            mobile_percent={data.devices.mobile_percent}
            desktop_percent={data.devices.desktop_percent}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !data && (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 lg:col-span-2" />
            <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
