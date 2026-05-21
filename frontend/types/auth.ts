export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  created_at: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiValidationError {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiUnauthorizedError {
  success: false;
  message: string;
}
