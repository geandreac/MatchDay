"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MeusDados() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: "",
  });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(null);
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ text: "Dados atualizados com sucesso!", ok: true });
      await update();
      router.refresh();
    } else {
      setMessage({ text: data.error ?? "Erro ao salvar.", ok: false });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-text">Meus Dados</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${message.ok ? "bg-primary/10 border border-primary/20 text-primary" : "bg-danger/10 border border-danger/20 text-danger"}`}>
            {message.ok ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Nome</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-base" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-base" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Telefone</label>
          <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-base" placeholder="(11) 99999-9999" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}
