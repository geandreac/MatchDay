"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao enviar. Tente novamente.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Erro de conexao.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm animate-fade-in-up text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Verifique seu email</h1>
          <p className="mt-2 text-sm text-text-2">Enviamos um link de recuperacao para <strong>{email}</strong>.</p>
          <p className="mt-1 text-xs text-text-3">O link expira em 1 hora. Verifique sua caixa de spam.</p>
        </div>
        <Link href="/login" className="btn-primary inline-block w-full text-center">Voltar ao Login</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold gradient-text">Esqueci a Senha</h1>
        <p className="mt-1 text-sm text-text-3">Digite seu email para receber o link de recuperacao</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="glass rounded-xl px-4 py-3 text-sm text-danger border border-danger/20 animate-fade-in" role="alert" id="forgot-error">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-base" placeholder="seu@email.com" required
            aria-invalid={!!error} aria-describedby={error ? "forgot-error" : undefined} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Enviando..." : "Enviar Link de Recuperacao"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-3">
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Voltar ao Login</Link>
      </p>
    </div>
  );
}
