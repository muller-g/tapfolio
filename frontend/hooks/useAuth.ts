"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setState({ user: data.data.user, isLoading: false });
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return state;
}

export function logout(): void {
  const token = localStorage.getItem("token");

  if (token) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  }

  localStorage.removeItem("token");
}
