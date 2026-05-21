"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import type { ApiValidationError } from "@/types/auth";

interface FieldErrors {
  name?: string[];
  username?: string[];
  email?: string[];
  password?: string[];
  password_confirmation?: string[];
}

export default function RegisterForm() {
  const router = useRouter();

  const [fields, setFields] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError("");
    setErrors({});

    try {
      const result = await AuthService.register(fields);
      localStorage.setItem("token", result.data.token);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiValidationError;
      if (apiError.errors) {
        setErrors(apiError.errors as FieldErrors);
      } else {
        setGeneralError("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {generalError && (
        <p role="alert" className="text-sm text-red-600">
          {generalError}
        </p>
      )}

      <Field
        label="Nome completo"
        id="name"
        name="name"
        type="text"
        value={fields.name}
        onChange={handleChange}
        errors={errors.name}
        autoComplete="name"
      />

      <Field
        label="Username"
        id="username"
        name="username"
        type="text"
        value={fields.username}
        onChange={handleChange}
        errors={errors.username}
        autoComplete="username"
        hint="Será sua URL pública: tapfolio.com/username"
      />

      <Field
        label="E-mail"
        id="email"
        name="email"
        type="email"
        value={fields.email}
        onChange={handleChange}
        errors={errors.email}
        autoComplete="email"
      />

      <Field
        label="Senha"
        id="password"
        name="password"
        type="password"
        value={fields.password}
        onChange={handleChange}
        errors={errors.password}
        autoComplete="new-password"
      />

      <Field
        label="Confirmar senha"
        id="password_confirmation"
        name="password_confirmation"
        type="password"
        value={fields.password_confirmation}
        onChange={handleChange}
        errors={errors.password_confirmation}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: string[];
  autoComplete?: string;
  hint?: string;
}

function Field({ label, id, name, type, value, onChange, errors, autoComplete, hint }: FieldProps) {
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={hasError}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 dark:bg-zinc-900 dark:text-white ${
          hasError
            ? "border-red-500 focus:ring-red-300"
            : "border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200 dark:border-zinc-700 dark:focus:border-zinc-500"
        }`}
      />
      {hint && !hasError && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      {hasError && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {errors![0]}
        </p>
      )}
    </div>
  );
}
