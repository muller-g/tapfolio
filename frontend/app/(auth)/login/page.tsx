import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar — TapFolio",
  description: "Entre na sua conta TapFolio e gerencie seus links.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Lado esquerdo — imagem */}
      <div className="hidden w-1/2 lg:block">
        {/* Placeholder: substituir pelo componente de imagem real */}
        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-900" aria-hidden="true" />
      </div>

      {/* Lado direito — formulário */}
      <div className="flex w-full flex-col items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
