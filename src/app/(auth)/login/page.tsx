"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email/CPF ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 glow-green animate-pulse-glow">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold gradient-text">MatchDay</h1>
        <p className="mt-2 text-sm text-text-3">Entre para gerenciar suas reservas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="glass rounded-xl px-4 py-3 text-sm text-danger border border-danger/20 animate-fade-in" role="alert" id="login-error">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="email">Email ou CPF</label>
          <input
            id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-base"
            placeholder="seu@email.com ou 000.000.000-00"
            required
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="password">Senha</label>
          <input
            id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando...
            </span>
          ) : "Entrar"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text-3">
        Nao tem conta?{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
          Cadastre-se
        </Link>
      </p>

      <p className="mt-3 text-center text-sm">
        <Link href="/forgot-password" className="text-text-3 hover:text-primary transition-colors">
          Esqueci minha senha
        </Link>
      </p>
    </div>
  );
}

