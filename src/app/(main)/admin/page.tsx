"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-8 space-y-6">
      <Link href="/menu" className="text-sm text-primary hover:underline">&larr; Voltar</Link>
      <h1 className="text-2xl font-bold text-text">Admin</h1>
      <p className="text-sm text-text-3">Painel administrativo do MatchDay.</p>
      <div className="card p-6 text-center">
        <p className="text-text-3">Painel administrativo em desenvolvimento.</p>
        <p className="text-xs text-text-3/60 mt-2">Em breve: gestão de usuários, campos e relatórios financeiros.</p>
      </div>
    </div>
  );
}
