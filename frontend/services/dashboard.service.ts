import type { DashboardResponse } from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export class DashboardService {
  static async getStats(days: 7 | 30 | 90 = 30): Promise<DashboardResponse> {
    const response = await fetch(`${API_URL}/dashboard?days=${days}`, {
      headers: authHeaders(),
    });

    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!response.ok) {
      throw new Error("Erro ao carregar dados do dashboard.");
    }

    return response.json() as Promise<DashboardResponse>;
  }
}
