"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppearanceService } from "@/services/appearance.service";
import { LinkService } from "@/services/link.service";
import type { Link } from "@/types/link";
import type { User } from "@/types/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonStyle = "filled" | "outline" | "soft";
type Tab = "editor" | "preview";

interface SubLink {
  id: string;
  title: string;
  url: string;
}

interface LinkAppearance {
  bio: string;
  avatarDataUrl: string | null;
  bgColor: string;
  bgImageDataUrl: string | null;
  buttonStyle: ButtonStyle;
  buttonAccent: string;
  buttonTextColor: string;
  social: Record<string, string>;
  subLinks: SubLink[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  {
    key: "instagram", label: "Instagram", placeholder: "seunome", color: "#e1306c",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>,
  },
  {
    key: "twitter", label: "X / Twitter", placeholder: "seunome", color: "#000000",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    key: "youtube", label: "YouTube", placeholder: "@seunome", color: "#ff0000",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
  {
    key: "tiktok", label: "TikTok", placeholder: "@seunome", color: "#010101",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z" /></svg>,
  },
  {
    key: "linkedin", label: "LinkedIn", placeholder: "seunome", color: "#0077b5",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    key: "spotify", label: "Spotify", placeholder: "seunome", color: "#1db954",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>,
  },
  {
    key: "github", label: "GitHub", placeholder: "seunome", color: "#333333",
    icon: <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL: LinkAppearance = {
  bio: "",
  avatarDataUrl: null,
  bgColor: "#ffffff",
  bgImageDataUrl: null,
  buttonStyle: "filled",
  buttonAccent: "#18181b",
  buttonTextColor: "#ffffff",
  social: {},
  subLinks: [],
};

function btnCss(style: ButtonStyle, accent: string, textColor: string = "#ffffff"): React.CSSProperties {
  switch (style) {
    case "filled":  return { backgroundColor: accent, color: textColor, border: "none" };
    case "outline": return { backgroundColor: "transparent", color: accent, border: `2px solid ${accent}` };
    case "soft":    return { backgroundColor: accent + "28", color: accent, border: "none" };
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────

function AvatarUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") onChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" onClick={() => ref.current?.click()} className="group relative" aria-label="Alterar foto de perfil">
        <div className="size-20 overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
          {value ? (
            <img src={value} alt="Avatar" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-zinc-400 dark:text-zinc-600">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
          </svg>
        </div>
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value && (
        <button type="button" onClick={() => onChange(null)} className="text-xs text-zinc-400 underline hover:text-red-500">
          Remover foto
        </button>
      )}
    </div>
  );
}

// ─── Image Upload (background) ────────────────────────────────────────────────

function BgImageUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") onChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <img src={value} alt="Fundo" className="h-24 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Remover imagem de fundo"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
        >
          <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Adicionar imagem de fundo
        </button>
      )}
    </div>
  );
}

// ─── Sub-links manager ────────────────────────────────────────────────────────

function SubLinksEditor({ items, onChange }: { items: SubLink[]; onChange: (v: SubLink[]) => void }) {
  function add() {
    onChange([...items, { id: uid(), title: "", url: "" }]);
  }

  function remove(id: string) {
    onChange(items.filter((l) => l.id !== id));
  }

  function update(id: string, field: "title" | "url", value: string) {
    onChange(items.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          {/* Reorder */}
          <div className="flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="Mover para cima"
              className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-300"
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              aria-label="Mover para baixo"
              className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-300"
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Fields */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              type="text"
              value={item.title}
              onChange={(e) => update(item.id, "title", e.target.value)}
              placeholder="Título do botão"
              className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none dark:text-white dark:placeholder-zinc-600"
            />
            <input
              type="url"
              value={item.url}
              onChange={(e) => update(item.id, "url", e.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent text-xs text-zinc-400 placeholder-zinc-300 outline-none dark:text-zinc-500 dark:placeholder-zinc-700"
            />
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(item.id)}
            aria-label="Remover botão"
            className="shrink-0 rounded-lg p-1 text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Adicionar botão
      </button>
    </div>
  );
}

// ─── Mobile Preview ───────────────────────────────────────────────────────────

interface PreviewProps {
  a: LinkAppearance;
  user: User | null;
}

function MobilePreview({ a, user }: PreviewProps) {
  const bStyle = btnCss(a.buttonStyle, a.buttonAccent, a.buttonTextColor);
  const activeSocials = SOCIAL_PLATFORMS.filter((p) => a.social[p.key]);
  const displayLinks = a.subLinks.filter((l) => l.title);

  const bg: React.CSSProperties = a.bgImageDataUrl
    ? { backgroundImage: `url(${a.bgImageDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: a.bgColor };

  const textColor = isLight(a.bgColor) ? "#18181b" : "#fafafa";
  const subColor = isLight(a.bgColor) ? "#71717a" : "#a1a1aa";

  return (
    <div className="flex select-none flex-col items-center">
      <div
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
        style={{ width: 270, backgroundColor: "#111", padding: 7, boxShadow: "0 0 0 1px #222, 0 30px 60px rgba(0,0,0,.5)" }}
      >
        <div className="relative overflow-hidden rounded-[2rem]" style={{ height: 550, ...bg }}>
          {/* Overlay for bg image readability */}
          {a.bgImageDataUrl && (
            <div className="absolute inset-0 rounded-[2rem]" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
          )}

          {/* Status bar */}
          <div className="relative flex items-center justify-between px-5 pt-3 pb-1">
            <span className="text-[10px] font-semibold" style={{ color: a.bgImageDataUrl ? "#fff" : subColor }}>9:41</span>
            <div className="h-3.5 w-20 rounded-full" style={{ backgroundColor: "#111" }} />
            <svg className="size-3.5" viewBox="0 0 24 24" fill={a.bgImageDataUrl ? "#fff" : subColor}>
              <path d="M1.371 5.956C5.087 2.54 9.998 2 12 2c2.002 0 6.913.54 10.629 3.956.354.327.375.88.047 1.234a.875.875 0 0 1-1.234.047C18.26 4.075 14.002 3.5 12 3.5c-2.002 0-6.26.575-9.441 3.737a.875.875 0 0 1-1.188-1.281ZM12 7.5c-1.74 0-4.313.484-6.002 2.033a.875.875 0 1 0 1.175 1.296C8.487 9.534 10.503 9 12 9c1.497 0 3.513.534 4.828 1.819a.875.875 0 1 0 1.174-1.296C16.313 7.984 13.74 7.5 12 7.5ZM12 12c-.97 0-2.152.3-2.994.985a.875.875 0 1 0 1.125 1.343A3.19 3.19 0 0 1 12 13.5a3.19 3.19 0 0 1 1.869.828.875.875 0 1 0 1.125-1.343C14.152 12.3 12.97 12 12 12ZM12 17.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative h-[calc(100%-32px)] overflow-y-auto pb-8">
            <div className="flex flex-col items-center gap-2 px-5 pt-4 pb-4">
              <div className="size-16 overflow-hidden rounded-full" style={{ border: `2.5px solid ${a.bgImageDataUrl ? "rgba(255,255,255,0.5)" : subColor + "50"}` }}>
                {a.avatarDataUrl ? (
                  <img src={a.avatarDataUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-xl font-bold" style={{ backgroundColor: (a.bgImageDataUrl ? "rgba(255,255,255,0.2)" : subColor + "25"), color: a.bgImageDataUrl ? "#fff" : textColor }}>
                    {user?.name?.charAt(0).toUpperCase() ?? "T"}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold" style={{ color: a.bgImageDataUrl ? "#fff" : textColor }}>
                @{user?.username ?? "username"}
              </p>
              {a.bio && (
                <p className="max-w-[200px] text-center text-[11px] leading-relaxed" style={{ color: a.bgImageDataUrl ? "rgba(255,255,255,0.8)" : subColor, whiteSpace: "pre-wrap" }}>
                  {a.bio}
                </p>
              )}
            </div>

            <div className="space-y-2 px-5">
              {displayLinks.length > 0 ? (
                displayLinks.slice(0, 7).map((link) => (
                  <div key={link.id} className="w-full rounded-xl px-4 py-2.5 text-center text-xs font-semibold" style={bStyle}>
                    {link.title}
                  </div>
                ))
              ) : (
                [{ id: "s1", title: "Meu Portfólio" }, { id: "s2", title: "Contato" }].map((l) => (
                  <div key={l.id} className="w-full rounded-xl px-4 py-2.5 text-center text-xs font-semibold" style={bStyle}>
                    {l.title}
                  </div>
                ))
              )}
            </div>

            {activeSocials.length > 0 && (
              <div className="mt-5 flex justify-center gap-4 px-4">
                {activeSocials.slice(0, 6).map((p) => (
                  <div key={p.key} style={{ color: a.bgImageDataUrl ? "#fff" : subColor }}>
                    {p.icon}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-600">Preview mobile</p>
    </div>
  );
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinkAppearancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [link, setLink] = useState<Link | null>(null);
  const [a, setA] = useState<LinkAppearance>(INITIAL);
  const [tab, setTab] = useState<Tab>("editor");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    LinkService.list().then((res) => {
      const found = res.data.find((l) => String(l.id) === id);
      setLink(found ?? null);
    }).catch(() => {});

    AppearanceService.getLinkAppearance(Number(id))
      .then((data) => { if (data) setA((prev) => ({ ...prev, ...data })); })
      .catch(() => {});
  }, [id]);

  function set<K extends keyof LinkAppearance>(key: K, value: LinkAppearance[K]) {
    setA((prev) => ({ ...prev, [key]: value }));
  }

  function setSocial(key: string, value: string) {
    setA((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await AppearanceService.saveLinkAppearance(Number(id), a);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => router.push("/dashboard/links")}
          aria-label="Voltar para Meus Links"
          className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Aparência</p>
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {link?.title ?? "Carregando…"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all disabled:opacity-60 ${
            saved
              ? "bg-green-600 text-white"
              : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          }`}
        >
          {saving ? "Salvando…" : saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="flex border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
        {(["editor", "preview"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {t === "editor" ? "Editar" : "Preview"}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Editor ─────────────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto ${tab === "preview" ? "hidden lg:block" : "block"}`}>
          <div className="mx-auto max-w-xl px-6 py-6 space-y-6">

            {/* ─ Perfil ─ */}
            <section aria-labelledby="s-profile">
              <h2 id="s-profile" className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Perfil</h2>
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <AvatarUpload value={a.avatarDataUrl} onChange={(v) => set("avatarDataUrl", v)} />
                <div>
                  <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                  <textarea
                    id="bio"
                    rows={2}
                    maxLength={160}
                    value={a.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Uma breve descrição sobre você…"
                    className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-zinc-700"
                  />
                  <p className="mt-0.5 text-right text-xs text-zinc-400">{a.bio.length}/160</p>
                </div>
              </div>
            </section>

            {/* ─ Fundo ─ */}
            <section aria-labelledby="s-bg">
              <h2 id="s-bg" className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Fundo</h2>
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor de fundo</p>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                      <input
                        type="color"
                        value={a.bgColor}
                        onChange={(e) => set("bgColor", e.target.value)}
                        className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                        aria-label="Cor de fundo"
                      />
                    </div>
                    <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{a.bgColor}</span>
                    {/* Quick swatches */}
                    {["#ffffff", "#18181b", "#fff1f2", "#f5f3ff", "#ecfdf5", "#f0f9ff"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set("bgColor", c)}
                        title={c}
                        className="size-6 rounded-full border border-zinc-300 dark:border-zinc-600 transition-transform hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Imagem de fundo</p>
                  <BgImageUpload value={a.bgImageDataUrl} onChange={(v) => set("bgImageDataUrl", v)} />
                  {a.bgImageDataUrl && (
                    <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                      A imagem sobrepõe a cor de fundo com uma camada escura para legibilidade.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ─ Botões ─ */}
            <section aria-labelledby="s-buttons">
              <h2 id="s-buttons" className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Botões</h2>
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Estilo</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["filled", "outline", "soft"] as ButtonStyle[]).map((style) => {
                      const labels: Record<ButtonStyle, string> = { filled: "Sólido", outline: "Contorno", soft: "Suave" };
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => set("buttonStyle", style)}
                          aria-pressed={a.buttonStyle === style}
                          className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                            a.buttonStyle === style
                              ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-white dark:ring-white"
                              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
                          }`}
                        >
                          <div className="w-full rounded-lg px-2 py-1 text-center text-[10px] font-semibold" style={btnCss(style, a.buttonAccent, a.buttonTextColor)}>Link</div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{labels[style]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor dos botões</p>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                      <input
                        type="color"
                        value={a.buttonAccent}
                        onChange={(e) => set("buttonAccent", e.target.value)}
                        className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                        aria-label="Cor dos botões"
                      />
                    </div>
                    <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{a.buttonAccent}</span>
                  </div>
                </div>
                {a.buttonStyle === "filled" && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor do texto do botão</p>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                        <input
                          type="color"
                          value={a.buttonTextColor}
                          onChange={(e) => set("buttonTextColor", e.target.value)}
                          className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                          aria-label="Cor do texto do botão"
                        />
                      </div>
                      <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{a.buttonTextColor}</span>
                      {["#ffffff", "#000000"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("buttonTextColor", c)}
                          title={c === "#ffffff" ? "Branco" : "Preto"}
                          className="size-6 rounded-full border border-zinc-300 dark:border-zinc-600 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ─ Links da Página ─ */}
            <section aria-labelledby="s-sublinks">
              <h2 id="s-sublinks" className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Links da Página</h2>
              <SubLinksEditor items={a.subLinks} onChange={(v) => set("subLinks", v)} />
            </section>

            {/* ─ Redes Sociais ─ */}
            <section aria-labelledby="s-social">
              <h2 id="s-social" className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Redes Sociais</h2>
              <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key} className="flex items-center gap-3 px-4 py-3">
                    <div className="shrink-0" style={{ color: platform.color }}>{platform.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{platform.label}</p>
                      <input
                        type="text"
                        value={a.social[platform.key] ?? ""}
                        onChange={(e) => setSocial(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-300 outline-none dark:text-white dark:placeholder-zinc-600"
                        aria-label={`Perfil ${platform.label}`}
                      />
                    </div>
                    {a.social[platform.key] && (
                      <button type="button" onClick={() => setSocial(platform.key, "")} aria-label={`Remover ${platform.label}`} className="shrink-0 rounded-md p-1 text-zinc-300 hover:text-red-400 dark:text-zinc-600">
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Save (bottom) */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-60 ${
                saved
                  ? "bg-green-600 text-white"
                  : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              }`}
            >
              {saving ? "Salvando…" : saved ? "Alterações salvas!" : "Salvar alterações"}
            </button>
          </div>
        </div>

        {/* ── Preview ─────────────────────────────────────────────────────── */}
        <div className={`items-start justify-center overflow-y-auto py-10 lg:flex lg:w-[360px] lg:shrink-0 lg:border-l lg:border-zinc-200 lg:bg-zinc-50 dark:lg:border-zinc-800 dark:lg:bg-zinc-950 ${tab === "editor" ? "hidden" : "flex"}`}>
          <MobilePreview a={a} user={user} />
        </div>
      </div>
    </div>
  );
}
