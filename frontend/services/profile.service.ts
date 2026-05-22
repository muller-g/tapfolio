import type { ProfileResponse } from "@/types/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

export class ProfileService {
  static async getProfile(username: string): Promise<ProfileResponse> {
    const res = await fetch(`${API_URL}/profile/${username}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 404) throw new Error("NOT_FOUND");
    if (!res.ok) throw new Error("Erro ao carregar perfil.");

    return res.json() as Promise<ProfileResponse>;
  }
}
