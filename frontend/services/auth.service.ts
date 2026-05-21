import type {
  ApiUnauthorizedError,
  ApiValidationError,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

export class AuthService {
  static async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiValidationError;
    }

    return data as RegisterResponse;
  }

  static async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiValidationError | ApiUnauthorizedError;
    }

    return data as LoginResponse;
  }
}
