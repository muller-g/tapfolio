import type { MetricsResponse } from "@/types/metrics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export class MetricsService {
  static async getMetrics(): Promise<MetricsResponse> {
    const response = await fetch(`${API_URL}/metrics`, { headers: authHeaders() });

    if (response.status === 401) throw new Error("UNAUTHORIZED");
    if (!response.ok) throw new Error("Erro ao carregar métricas.");

    return response.json() as Promise<MetricsResponse>;
  }
}
