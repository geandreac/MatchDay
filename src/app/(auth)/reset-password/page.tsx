"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas nao coincidem."); return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Erro de conexao.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="w-full max-w-sm animate-fade-in-up text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Senha Alterada</h1>
          <p className="mt-2 text-sm text-text-2">Sua senha foi redefinida com sucesso.</p>
          <p className="mt-1 text-xs text-text-3">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="w-full max-w-sm animate-fade-in-up text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Link Invalido</h1>
          <p className="mt-2 text-sm text-text-2">O link de recuperacao e invalido ou esta incompleto.</p>
        </div>
        <Link href="/forgot-password" className="btn-primary inline-block w-full text-center">Solicitar Novo Link</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold gradient-text">Redefinir Senha</h1>
        <p className="mt-1 text-sm text-text-3">Digite sua nova senha</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="glass rounded-xl px-4 py-3 text-sm text-danger border border-danger/20 animate-fade-in" role="alert" id="reset-error">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="password">Nova Senha</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input-base" placeholder="Minimo 8 caracteres" required
            aria-invalid={!!error} aria-describedby={error ? "reset-error" : undefined} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="confirm">Confirmar Senha</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="input-base" placeholder="Repita a senha" required />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Salvando..." : "Redefinir Senha"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
