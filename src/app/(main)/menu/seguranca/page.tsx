"use client";

import { useState } from "react";
import { csrfFetch } from "@/lib/csrf-client";

export default function Seguranca() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ text: "As senhas não coincidem.", ok: false }); setSaving(false); return;
    }
    if (form.newPassword.length < 8) {
      setMessage({ text: "A senha deve ter pelo menos 8 caracteres.", ok: false }); setSaving(false); return;
    }

    const res = await csrfFetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ text: "Senha alterada com sucesso!", ok: true });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setMessage({ text: data.error ?? "Erro ao alterar senha.", ok: false });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-text">Segurança</h2>

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
          <label className="text-sm font-medium text-text-2">Senha Atual</label>
          <input type="password" value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} className="input-base" placeholder="••••••••" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Nova Senha</label>
          <input type="password" value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} className="input-base" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Confirmar Nova Senha</label>
          <input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="input-base" placeholder="Repita a nova senha" required />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Salvando..." : "Alterar Senha"}
        </button>
      </form>
    </div>
  );
}

