import type { GlobalAppearance, LinkAppearance, AppearanceResponse } from "@/types/appearance";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string })?.message || "Erro inesperado.");
  }
  return res.json() as Promise<T>;
}

export class AppearanceService {
  static async getGlobal(): Promise<GlobalAppearance | null> {
    const res = await fetch(`${API_URL}/appearance`, { headers: authHeaders() });
    const data = await handleResponse<AppearanceResponse>(res);
    const raw = data.data.appearance;
    return raw && Object.keys(raw).length > 0 ? (raw as GlobalAppearance) : null;
  }

  static async saveGlobal(appearance: GlobalAppearance): Promise<void> {
    const res = await fetch(`${API_URL}/appearance`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ appearance }),
    });
    await handleResponse<AppearanceResponse>(res);
  }

  static async getLinkAppearance(linkId: number): Promise<LinkAppearance | null> {
    const res = await fetch(`${API_URL}/links/${linkId}/appearance`, { headers: authHeaders() });
    const data = await handleResponse<AppearanceResponse>(res);
    const raw = data.data.appearance;
    return raw && Object.keys(raw).length > 0 ? (raw as LinkAppearance) : null;
  }

  static async saveLinkAppearance(linkId: number, appearance: LinkAppearance): Promise<void> {
    const res = await fetch(`${API_URL}/links/${linkId}/appearance`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ appearance }),
    });
    await handleResponse<AppearanceResponse>(res);
  }
}
