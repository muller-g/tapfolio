import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta — TapFolio",
  description: "Crie sua conta no TapFolio e centralize todos os seus links em um único lugar.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Crie sua conta
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Centralize todos os seus links em um único lugar.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
