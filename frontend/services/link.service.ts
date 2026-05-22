import type { CreateLinkPayload, LinkListResponse, LinkResponse, UpdateLinkPayload } from "@/types/link";

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
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || "Erro inesperado.");
  }
  return res.json() as Promise<T>;
}

export class LinkService {
  static async list(page = 1): Promise<LinkListResponse> {
    const res = await fetch(`${API_URL}/links?page=${page}`, {
      headers: authHeaders(),
    });
    return handleResponse<LinkListResponse>(res);
  }

  static async create(payload: CreateLinkPayload): Promise<LinkResponse> {
    const res = await fetch(`${API_URL}/links`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<LinkResponse>(res);
  }

  static async update(id: number, payload: UpdateLinkPayload): Promise<LinkResponse> {
    const res = await fetch(`${API_URL}/links/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<LinkResponse>(res);
  }

  static async toggle(id: number): Promise<LinkResponse> {
    const res = await fetch(`${API_URL}/links/${id}/toggle`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return handleResponse<LinkResponse>(res);
  }

  static async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/links/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    await handleResponse<{ success: boolean }>(res);
  }

  static async reorder(ids: number[]): Promise<void> {
    const res = await fetch(`${API_URL}/links/reorder`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ ids }),
    });
    await handleResponse<{ success: boolean }>(res);
  }
}
