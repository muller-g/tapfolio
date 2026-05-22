"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import type { ApiUnauthorizedError, ApiValidationError } from "@/types/auth";

interface FieldErrors {
  email?: string[];
  password?: string[];
}

export default function LoginForm() {
  const router = useRouter();

  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGeneralError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError("");
    setErrors({});

    try {
      const result = await AuthService.login(fields);
      localStorage.setItem("token", result.data.token);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiValidationError | ApiUnauthorizedError;
      if ("errors" in apiError && apiError.errors) {
        setErrors(apiError.errors as FieldErrors);
      } else {
        setGeneralError(apiError.message ?? "Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Entre na sua conta para acessar seus links.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {generalError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {generalError}
          </p>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            autoComplete="email"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:ring-2 ${
              errors.email
                ? "border-red-400 focus:ring-red-200"
                : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
            }`}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.email[0]}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700"
            >
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={fields.password}
            onChange={handleChange}
            autoComplete="current-password"
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:ring-2 ${
              errors.password
                ? "border-red-400 focus:ring-red-200"
                : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
            }`}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-zinc-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
