"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarCampo() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", cep: "", address: "", city: "", state: "", description: "",
    capacity: "10", pricePerHour: "", startHour: "17", endHour: "23",
  });
  const [fieldId, setFieldId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const id = (await params).id as string;
      setFieldId(id);
      const res = await fetch(`/api/fields/${id}`);
      if (res.ok) {
        const f = await res.json();
        setForm({
          name: f.name, cep: f.cep || "", address: f.address, city: f.city,
          state: f.state || "", description: f.description || "",
          capacity: String(f.capacity), pricePerHour: String(f.pricePerHour),
          startHour: String(f.startHour), endHour: String(f.endHour),
        });
      }
      setLoading(false);
    })();
  }, [params]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const id = (await params).id;
    const res = await fetch(`/api/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push(`/owner/campos/${id}`); router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao salvar.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger">
      <div className="flex items-center gap-3">
        <Link href={`/owner/campos/${fieldId}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors text-text-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">Editar Campo</h2>
          <p className="text-sm text-text-3">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">{error}</div>}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Nome *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-base" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Endereço *</label>
          <input name="address" value={form.address} onChange={handleChange} className="input-base" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Cidade *</label>
            <input name="city" value={form.city} onChange={handleChange} className="input-base" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Estado</label>
            <input name="state" value={form.state} onChange={handleChange} className="input-base" maxLength={2} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Preço/Hora *</label>
            <input name="pricePerHour" type="number" step="0.01" value={form.pricePerHour} onChange={handleChange} className="input-base" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Capacidade</label>
            <input name="capacity" type="number" value={form.capacity} onChange={handleChange} className="input-base" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Início</label>
            <select name="startHour" value={form.startHour} onChange={handleChange} className="input-base">
              {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Fim</label>
            <select name="endHour" value={form.endHour} onChange={handleChange} className="input-base">
              {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-base" />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href={`/owner/campos/${fieldId}`} className="btn-secondary flex-1 text-center">Cancelar</Link>
          <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}
