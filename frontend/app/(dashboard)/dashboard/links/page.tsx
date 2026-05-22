"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LinkService } from "@/services/link.service";
import type { Link, CreateLinkPayload, UpdateLinkPayload } from "@/types/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildProfileUrl(username: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/${username}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconLink() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-white ${checked ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700"}`}
    >
      <span
        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-zinc-900 ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Profile URL Banner ───────────────────────────────────────────────────────

function ProfileUrlBanner({ username }: { username: string }) {
  const url = buildProfileUrl(username);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <IconLink />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Sua URL pública</p>
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{url}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar URL"
        title={copied ? "Copiado!" : "Copiar URL"}
        className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        {copied ? (
          <svg className="size-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <IconCopy />
        )}
      </button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface LinkFormData {
  title: string;
  is_active: boolean;
}

interface LinkModalProps {
  link?: Link | null;
  username: string;
  onClose: () => void;
  onSave: (data: LinkFormData) => Promise<void>;
}

function LinkModal({ link, username, onClose, onSave }: LinkModalProps) {
  const isEditing = Boolean(link);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const profileUrl = buildProfileUrl(username);

  const [form, setForm] = useState<LinkFormData>({
    title: link?.title ?? "",
    is_active: link?.is_active ?? true,
  });
  const [titleError, setTitleError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function validate(): boolean {
    if (!form.title.trim()) {
      setTitleError("O título é obrigatório.");
      return false;
    }
    if (form.title.length > 255) {
      setTitleError("Máximo 255 caracteres.");
      return false;
    }
    setTitleError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Editar link" : "Novo link"}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {isEditing ? "Editar link" : "Novo link"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="link-title" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nome do link
            </label>
            <input
              ref={firstInputRef}
              id="link-title"
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                if (titleError) setTitleError("");
              }}
              placeholder="Ex: Bio do Instagram"
              maxLength={255}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 ${titleError ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900" : "border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:focus:border-white dark:focus:ring-zinc-700"}`}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "title-error" : undefined}
            />
            {titleError && (
              <p id="title-error" className="mt-1 text-xs text-red-500">{titleError}</p>
            )}
          </div>

          {/* Auto-generated URL (read-only) */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL do link
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <span className="flex-1 truncate text-sm text-zinc-500 dark:text-zinc-400" title={profileUrl}>
                {profileUrl}
              </span>
              <span className="shrink-0 rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                automático
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Todos os seus links apontam para sua página pública.
            </p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ativo</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Visível na sua página pública</p>
            </div>
            <Toggle
              checked={form.is_active}
              onChange={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {saving ? "Salvando…" : isEditing ? "Salvar" : "Criar link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

interface DeleteConfirmProps {
  link: Link;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteConfirm({ link, onCancel, onConfirm }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar exclusão"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Remover link</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Tem certeza que deseja remover{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">"{link.title}"</span>?
          {" "}Esta ação não pode ser desfeita.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Removendo…" : "Remover"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Link Card ────────────────────────────────────────────────────────────────

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onToggle: (link: Link) => void;
  onAppearance: (link: Link) => void;
  toggling: boolean;
}

function LinkCard({ link, onEdit, onDelete, onToggle, onAppearance, toggling }: LinkCardProps) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-opacity dark:bg-zinc-900 ${link.is_active ? "border-zinc-200 dark:border-zinc-800" : "border-dashed border-zinc-200 opacity-60 dark:border-zinc-800"}`}>
      {/* Icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <IconLink />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{link.title}</p>
        <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{link.url}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Toggle checked={link.is_active} onChange={() => onToggle(link)} disabled={toggling} />

        <button
          type="button"
          onClick={() => onAppearance(link)}
          aria-label={`Editar aparência de ${link.title}`}
          title="Editar aparência"
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-950 dark:hover:text-violet-400"
        >
          <IconPalette />
        </button>

        <button
          type="button"
          onClick={() => onEdit(link)}
          aria-label={`Editar ${link.title}`}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <IconPencil />
        </button>

        <button
          type="button"
          onClick={() => onDelete(link)}
          aria-label={`Remover ${link.title}`}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <IconLink />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Nenhum link criado ainda</p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Adicione o primeiro link da sua página.</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        <IconPlus />
        Criar link
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "create" }
  | { type: "edit"; link: Link }
  | { type: "delete"; link: Link }
  | null;

export default function LinksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    setLoading(true);
    setError("");
    try {
      const res = await LinkService.list();
      setLinks(res.data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== "UNAUTHORIZED") {
        setError("Erro ao carregar seus links. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: { title: string; is_active: boolean }) {
    if (modal?.type === "create") {
      const res = await LinkService.create(data as CreateLinkPayload);
      setLinks((prev) => [...prev, res.data]);
    } else if (modal?.type === "edit") {
      const res = await LinkService.update(modal.link.id, data as UpdateLinkPayload);
      setLinks((prev) => prev.map((l) => (l.id === res.data.id ? res.data : l)));
    }
    setModal(null);
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    await LinkService.remove(modal.link.id);
    setLinks((prev) => prev.filter((l) => l.id !== modal.link.id));
    setModal(null);
  }

  function handleAppearance(link: Link) {
    router.push(`/dashboard/links/${link.id}/appearance`);
  }

  async function handleToggle(link: Link) {
    setTogglingId(link.id);
    try {
      const res = await LinkService.toggle(link.id);
      setLinks((prev) => prev.map((l) => (l.id === res.data.id ? res.data : l)));
    } catch {
      setError("Não foi possível alterar o status do link.");
    } finally {
      setTogglingId(null);
    }
  }

  const activeCount = links.filter((l) => l.is_active).length;
  const username = user?.username ?? "";

  return (
    <>
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Meus Links
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {loading
                ? "Carregando…"
                : `${links.length} link${links.length !== 1 ? "s" : ""} • ${activeCount} ativo${activeCount !== 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <IconPlus />
            Novo link
          </button>
        </div>

        {/* Profile URL banner */}
        {username && <ProfileUrlBanner username={username} />}

        {error && (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Carregando links">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && links.length === 0 && (
          <EmptyState onCreate={() => setModal({ type: "create" })} />
        )}

        {/* Links list */}
        {!loading && links.length > 0 && (
          <ul className="space-y-3" role="list">
            {links.map((link) => (
              <li key={link.id}>
                <LinkCard
                  link={link}
                  onEdit={(l) => setModal({ type: "edit", link: l })}
                  onDelete={(l) => setModal({ type: "delete", link: l })}
                  onToggle={handleToggle}
                  onAppearance={handleAppearance}
                  toggling={togglingId === link.id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "create" && username && (
        <LinkModal username={username} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === "edit" && username && (
        <LinkModal link={modal.link} username={username} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === "delete" && (
        <DeleteConfirm link={modal.link} onCancel={() => setModal(null)} onConfirm={handleDelete} />
      )}
    </>
  );
}
