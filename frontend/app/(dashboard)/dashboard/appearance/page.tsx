"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppearanceService } from "@/services/appearance.service";
import { LinkService } from "@/services/link.service";
import type { Link } from "@/types/link";
import type { User } from "@/types/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonStyle = "filled" | "outline" | "soft";
type Tab = "editor" | "preview";

interface Theme {
  id: string;
  label: string;
  bg: string;
  text: string;
  sub: string;
  accent: string;
}

interface AppearanceState {
  bio: string;
  avatarDataUrl: string | null;
  themeId: string;
  buttonStyle: ButtonStyle;
  buttonAccent: string;
  buttonTextColor: string;
  bioTextColor: string;
  usernameTextColor: string;
  socialIconColor: string;
  social: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THEMES: Theme[] = [
  { id: "white",   label: "Branco",    bg: "#ffffff", text: "#18181b", sub: "#71717a", accent: "#18181b" },
  { id: "dark",    label: "Escuro",    bg: "#18181b", text: "#fafafa",  sub: "#a1a1aa", accent: "#e4e4e7" },
  { id: "rose",    label: "Rosa",      bg: "#fff1f2", text: "#9f1239",  sub: "#f43f5e", accent: "#f43f5e" },
  { id: "violet",  label: "Violeta",   bg: "#f5f3ff", text: "#4c1d95",  sub: "#7c3aed", accent: "#7c3aed" },
  { id: "amber",   label: "Âmbar",    bg: "#fffbeb", text: "#78350f",  sub: "#d97706", accent: "#d97706" },
  { id: "emerald", label: "Esmeralda", bg: "#ecfdf5", text: "#064e3b",  sub: "#059669", accent: "#059669" },
  { id: "sky",     label: "Céu",       bg: "#f0f9ff", text: "#0c4a6e",  sub: "#0284c7", accent: "#0284c7" },
  { id: "slate",   label: "Ardósia",   bg: "#f8fafc", text: "#0f172a",  sub: "#475569", accent: "#334155" },
];

const SOCIAL_PLATFORMS = [
  {
    key: "instagram", label: "Instagram", placeholder: "seunome", color: "#e1306c",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    key: "twitter", label: "X / Twitter", placeholder: "seunome", color: "#000000",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "youtube", label: "YouTube", placeholder: "@seunome", color: "#ff0000",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "tiktok", label: "TikTok", placeholder: "@seunome", color: "#010101",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z" />
      </svg>
    ),
  },
  {
    key: "linkedin", label: "LinkedIn", placeholder: "seunome", color: "#0077b5",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: "spotify", label: "Spotify", placeholder: "seunome", color: "#1db954",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    key: "github", label: "GitHub", placeholder: "seunome", color: "#333333",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL: AppearanceState = {
  bio: "",
  avatarDataUrl: null,
  themeId: "white",
  buttonStyle: "filled",
  buttonAccent: "#18181b",
  buttonTextColor: "#ffffff",
  bioTextColor: "",
  usernameTextColor: "",
  socialIconColor: "",
  social: {},
};

function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

function btnCss(style: ButtonStyle, accent: string, textColor: string): React.CSSProperties {
  switch (style) {
    case "filled":  return { backgroundColor: accent, color: textColor, border: "none" };
    case "outline": return { backgroundColor: "transparent", color: accent, border: `2px solid ${accent}` };
    case "soft":    return { backgroundColor: accent + "28", color: accent, border: "none" };
  }
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────

function AvatarUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
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
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="group relative"
        aria-label="Alterar foto de perfil"
      >
        <div className="size-24 overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
          {value ? (
            <img src={value} alt="Foto de perfil" className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
              <svg className="size-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        </div>
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="text-center">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Toque para alterar foto</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-0.5 text-xs text-zinc-400 underline hover:text-red-500"
          >
            Remover foto
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mobile Preview ───────────────────────────────────────────────────────────

const SAMPLE_LINKS = [
  { id: -1, title: "Meu Portfólio" },
  { id: -2, title: "Instagram" },
  { id: -3, title: "Contato" },
];

interface PreviewProps {
  state: AppearanceState;
  user: User | null;
  links: Link[];
}

function MobilePreview({ state, user, links }: PreviewProps) {
  const theme = getTheme(state.themeId);
  const bStyle = btnCss(state.buttonStyle, state.buttonAccent, state.buttonTextColor);
  const activeLinks = links.filter((l) => l.is_active);
  const displayLinks = activeLinks.length > 0 ? activeLinks : SAMPLE_LINKS;
  const activeSocials = SOCIAL_PLATFORMS.filter((p) => state.social[p.key]);

  return (
    <div className="flex select-none flex-col items-center">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
        style={{ width: 270, backgroundColor: "#111", padding: 7, boxShadow: "0 0 0 1px #222, 0 30px 60px rgba(0,0,0,.5)" }}
      >
        {/* Screen */}
        <div
          className="relative overflow-hidden rounded-[2rem]"
          style={{ height: 550, backgroundColor: theme.bg }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <span className="text-[10px] font-semibold" style={{ color: theme.sub }}>9:41</span>
            <div className="h-3.5 w-20 rounded-full" style={{ backgroundColor: "#111" }} />
            <svg className="size-3.5" viewBox="0 0 24 24" fill={theme.sub} aria-hidden="true">
              <path d="M1.371 5.956C5.087 2.54 9.998 2 12 2c2.002 0 6.913.54 10.629 3.956.354.327.375.88.047 1.234a.875.875 0 0 1-1.234.047C18.26 4.075 14.002 3.5 12 3.5c-2.002 0-6.26.575-9.441 3.737a.875.875 0 0 1-1.188-1.281ZM12 7.5c-1.74 0-4.313.484-6.002 2.033a.875.875 0 1 0 1.175 1.296C8.487 9.534 10.503 9 12 9c1.497 0 3.513.534 4.828 1.819a.875.875 0 1 0 1.174-1.296C16.313 7.984 13.74 7.5 12 7.5ZM12 12c-.97 0-2.152.3-2.994.985a.875.875 0 1 0 1.125 1.343A3.19 3.19 0 0 1 12 13.5a3.19 3.19 0 0 1 1.869.828.875.875 0 1 0 1.125-1.343C14.152 12.3 12.97 12 12 12ZM12 17.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
            </svg>
          </div>

          {/* Scrollable content */}
          <div className="h-[calc(100%-32px)] overflow-y-auto pb-8" style={{ backgroundColor: theme.bg }}>
            {/* Avatar + name + bio */}
            <div className="flex flex-col items-center gap-2 px-5 pt-5 pb-4">
              <div
                className="size-16 overflow-hidden rounded-full"
                style={{ border: `2.5px solid ${theme.sub}50` }}
              >
                {state.avatarDataUrl ? (
                  <img src={state.avatarDataUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div
                    className="flex size-full items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: theme.sub + "25", color: theme.text }}
                  >
                    {user?.name?.charAt(0).toUpperCase() ?? "T"}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold" style={{ color: state.usernameTextColor || theme.text }}>
                @{user?.username ?? "username"}
              </p>
              {state.bio && (
                <p
                  className="max-w-[200px] text-center text-[11px] leading-relaxed"
                  style={{ color: state.bioTextColor || theme.sub }}
                >
                  {state.bio}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="space-y-2 px-5">
              {displayLinks.slice(0, 6).map((link) => (
                <div
                  key={link.id}
                  className="w-full rounded-xl px-4 py-2.5 text-center text-xs font-semibold"
                  style={bStyle}
                >
                  {link.title}
                </div>
              ))}
            </div>

            {/* Social icons */}
            {activeSocials.length > 0 && (
              <div className="mt-5 flex justify-center gap-4 px-4">
                {activeSocials.slice(0, 6).map((p) => (
                  <div key={p.key} style={{ color: state.socialIconColor || theme.sub, width: 20, height: 20 }}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const { user } = useAuth();
  const [state, setState] = useState<AppearanceState>(INITIAL);
  const [links, setLinks] = useState<Link[]>([]);
  const [tab, setTab] = useState<Tab>("editor");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    AppearanceService.getGlobal()
      .then((data) => { if (data) setState((prev) => ({ ...prev, ...data })); })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    LinkService.list().then((res) => setLinks(res.data)).catch(() => {});
  }, []);

  function set<K extends keyof AppearanceState>(key: K, value: AppearanceState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function setSocial(key: string, value: string) {
    setState((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function handleThemeChange(themeId: string) {
    const theme = getTheme(themeId);
    setState((prev) => ({ ...prev, themeId, buttonAccent: theme.accent }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await AppearanceService.saveGlobal(state);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  const theme = getTheme(state.themeId);

  return (
    <div className="flex h-full flex-col">
      {/* Mobile tab bar */}
      <div className="flex border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
        {(["editor", "preview"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
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
        {/* ── Editor panel ───────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto ${tab === "preview" ? "hidden lg:block" : "block"}`}>
          <div className="mx-auto max-w-xl px-6 py-8">
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Aparência</h1>
            <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
              Personalize como sua página pública aparece para os visitantes.
            </p>

            {/* ─ Profile ─ */}
            <section aria-labelledby="section-profile" className="mb-8">
              <h2
                id="section-profile"
                className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
              >
                Perfil
              </h2>
              <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <AvatarUpload
                  value={state.avatarDataUrl}
                  onChange={(url) => set("avatarDataUrl", url)}
                />
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    maxLength={160}
                    value={state.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Uma breve descrição sobre você..."
                    className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:ring-zinc-700"
                  />
                  <p className="mt-1 text-right text-xs text-zinc-400">{state.bio.length}/160</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor do @username</p>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                      <input
                        type="color"
                        value={state.usernameTextColor || theme.text}
                        onChange={(e) => set("usernameTextColor", e.target.value)}
                        className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                        aria-label="Escolher cor do @username"
                      />
                    </div>
                    <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                      {state.usernameTextColor || theme.text}
                    </span>
                    {state.usernameTextColor && (
                      <button
                        type="button"
                        onClick={() => set("usernameTextColor", "")}
                        className="rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor do texto da bio</p>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                      <input
                        type="color"
                        value={state.bioTextColor || theme.sub}
                        onChange={(e) => set("bioTextColor", e.target.value)}
                        className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                        aria-label="Escolher cor do texto da bio"
                      />
                    </div>
                    <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                      {state.bioTextColor || theme.sub}
                    </span>
                    {state.bioTextColor && (
                      <button
                        type="button"
                        onClick={() => set("bioTextColor", "")}
                        className="rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ─ Theme ─ */}
            <section aria-labelledby="section-theme" className="mb-8">
              <h2
                id="section-theme"
                className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
              >
                Tema
              </h2>
              <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                {/* Color presets */}
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor de fundo</p>
                  <div className="grid grid-cols-4 gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleThemeChange(t.id)}
                        title={t.label}
                        aria-pressed={state.themeId === t.id}
                        className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
                          state.themeId === t.id
                            ? "ring-2 ring-zinc-900 ring-offset-1 dark:ring-white"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div
                          className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                          style={{ backgroundColor: t.bg }}
                        />
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button style */}
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Estilo dos botões</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["filled", "outline", "soft"] as ButtonStyle[]).map((style) => {
                      const labels: Record<ButtonStyle, string> = { filled: "Sólido", outline: "Contorno", soft: "Suave" };
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => set("buttonStyle", style)}
                          aria-pressed={state.buttonStyle === style}
                          className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                            state.buttonStyle === style
                              ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-white dark:ring-white"
                              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                          }`}
                        >
                          <div
                            className="w-full rounded-lg px-2 py-1 text-center text-[10px] font-semibold"
                            style={btnCss(style, theme.accent, state.buttonTextColor)}
                          >
                            Link
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{labels[style]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent color */}
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor dos botões</p>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                      <input
                        type="color"
                        value={state.buttonAccent}
                        onChange={(e) => set("buttonAccent", e.target.value)}
                        className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                        aria-label="Escolher cor dos botões"
                      />
                    </div>
                    <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{state.buttonAccent}</span>
                  </div>
                </div>

                {/* Button text color — only relevant for filled style */}
                {state.buttonStyle === "filled" && (
                  <div>
                    <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor do texto do botão</p>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                        <input
                          type="color"
                          value={state.buttonTextColor}
                          onChange={(e) => set("buttonTextColor", e.target.value)}
                          className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                          aria-label="Escolher cor do texto do botão"
                        />
                      </div>
                      <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{state.buttonTextColor}</span>
                      {/* Quick presets */}
                      {["#ffffff", "#000000"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("buttonTextColor", c)}
                          title={c === "#ffffff" ? "Branco" : "Preto"}
                          className="size-7 rounded-lg border border-zinc-300 text-[10px] font-bold transition-transform hover:scale-110 dark:border-zinc-600"
                          style={{ backgroundColor: c, color: c === "#ffffff" ? "#000" : "#fff" }}
                        >
                          {c === "#ffffff" ? "A" : "A"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ─ Social ─ */}
            <section aria-labelledby="section-social" className="mb-8">
              <h2
                id="section-social"
                className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
              >
                Redes Sociais
              </h2>
              <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor dos ícones</p>
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                    <input
                      type="color"
                      value={state.socialIconColor || theme.sub}
                      onChange={(e) => set("socialIconColor", e.target.value)}
                      className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
                      aria-label="Escolher cor dos ícones sociais"
                    />
                  </div>
                  <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                    {state.socialIconColor || theme.sub}
                  </span>
                  {state.socialIconColor && (
                    <button
                      type="button"
                      onClick={() => set("socialIconColor", "")}
                      className="rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key} className="flex items-center gap-3 px-4 py-3">
                    <div className="shrink-0" style={{ color: platform.color }}>
                      {platform.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                        {platform.label}
                      </p>
                      <input
                        type="text"
                        value={state.social[platform.key] ?? ""}
                        onChange={(e) => setSocial(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-300 outline-none dark:text-white dark:placeholder-zinc-600"
                        aria-label={`Perfil ${platform.label}`}
                      />
                    </div>
                    {state.social[platform.key] && (
                      <button
                        type="button"
                        onClick={() => setSocial(platform.key, "")}
                        aria-label={`Remover ${platform.label}`}
                        className="shrink-0 rounded-md p-1 text-zinc-300 transition-colors hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
                      >
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {loadError && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                Não foi possível carregar as configurações salvas.
              </p>
            )}

            {/* Save */}
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

        {/* ── Preview panel ──────────────────────────────────────────────── */}
        <div
          className={`items-start justify-center overflow-y-auto py-10 lg:flex lg:w-[360px] lg:shrink-0 lg:border-l lg:border-zinc-200 lg:bg-zinc-50 dark:lg:border-zinc-800 dark:lg:bg-zinc-950 ${
            tab === "editor" ? "hidden" : "flex"
          }`}
        >
          <MobilePreview state={state} user={user} links={links} />
        </div>
      </div>
    </div>
  );
}
