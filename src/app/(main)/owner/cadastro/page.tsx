"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroCampo() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", description: "",
    capacity: "10", pricePerHour: "", startHour: "17", endHour: "23",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.address || !form.city || !form.pricePerHour) {
      setError("Preencha todos os campos obrigatórios."); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao cadastrar campo."); setLoading(false); return; }
      router.push("/owner"); router.refresh();
    } catch { setError("Erro ao conectar com o servidor."); setLoading(false); }
  }

  return (
    <div className="space-y-6 stagger">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">Cadastrar Campo</h2>
          <p className="text-sm text-text-3">Preencha os dados do seu campo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="glass rounded-xl px-4 py-3 text-sm text-danger border border-danger/20 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="name">Nome do Campo *</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} className="input-base" placeholder="Ex: Arena Show de Bola" required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="address">Endereço *</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} className="input-base" placeholder="Rua, número, bairro" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2" htmlFor="city">Cidade *</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} className="input-base" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2" htmlFor="state">Estado</label>
            <input id="state" name="state" value={form.state} onChange={handleChange} className="input-base" placeholder="SP" maxLength={2} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2" htmlFor="pricePerHour">Preço por Hora (R$) *</label>
            <input id="pricePerHour" name="pricePerHour" type="number" step="0.01" min="0" value={form.pricePerHour} onChange={handleChange} className="input-base" placeholder="150" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2" htmlFor="capacity">Capacidade</label>
            <input id="capacity" name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} className="input-base" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2" htmlFor="startHour">Horário Início</label>
            <select id="startHour" name="startHour" value={form.startHour} onChange={handleChange} className="input-base">
              {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2" htmlFor="endHour">Horário Fim</label>
            <select id="endHour" name="endHour" value={form.endHour} onChange={handleChange} className="input-base">
              {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="description">Descrição</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} className="input-base" placeholder="Gramado, iluminação, estacionamento..." />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/owner" className="btn-secondary flex-1 text-center">Cancelar</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Salvando..." : "Cadastrar Campo"}
          </button>
        </div>
      </form>
    </div>
  );
}

