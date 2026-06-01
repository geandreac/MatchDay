"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhotoUpload } from "@/components/photo-upload";

export default function CadastroCampo() {
  const router = useRouter();
  const [form, setForm] = useState({
    cep: "", name: "", address: "", city: "", state: "", description: "",
    gameFormat: "7x7", pricePerHour: "", startHour: "17", endHour: "23",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cep") {
      formatted = value.replace(/\D/g, "").slice(0, 8);
      if (formatted.length > 5) formatted = `${formatted.slice(0, 5)}-${formatted.slice(5)}`;
    }
    setForm((prev) => ({ ...prev, [name]: formatted }));
  }

  async function buscarCep() {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro ? `${data.logradouro}, ${prev.address.split(",")[1]?.trim() ?? ""}`.trim().replace(/,$/, "") : prev.address,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch {}
    setBuscandoCep(false);
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
        body: JSON.stringify({ ...form, cep: form.cep.replace(/\D/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao cadastrar campo."); setLoading(false); return; }

      if (photos.length > 0) {
        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldId: data.id, photos }),
        });
      }

      router.push("/owner"); router.refresh();
    } catch { setError("Erro ao conectar com o servidor."); setLoading(false); }
  }

  return (
    <div className="space-y-6 stagger">
      <div className="flex items-center gap-3">
        <Link href="/owner/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors text-text-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">Cadastrar Campo</h2>
          <p className="text-sm text-text-3">Informe os dados do seu campo</p>
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
          <label className="text-sm font-medium text-text-2">Nome do Campo *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-base" placeholder="Ex: Arena Show de Bola" required />
        </div>

        {/* CEP */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">CEP</label>
          <div className="flex gap-2">
            <input name="cep" value={form.cep} onChange={handleChange} onBlur={buscarCep}
              className="input-base flex-1" placeholder="00000-000" maxLength={9} />
            <button type="button" onClick={buscarCep} disabled={buscandoCep || form.cep.replace(/\D/g, "").length !== 8}
              className="btn-secondary text-sm px-3 whitespace-nowrap">
              {buscandoCep ? "..." : "Buscar"}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Endereço *</label>
          <input name="address" value={form.address} onChange={handleChange} className="input-base" placeholder="Rua, número, bairro" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Cidade *</label>
            <input name="city" value={form.city} onChange={handleChange} className="input-base" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Estado</label>
            <input name="state" value={form.state} onChange={handleChange} className="input-base" placeholder="SP" maxLength={2} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Preço por Hora (R$) *</label>
            <input name="pricePerHour" type="number" step="0.01" min="0" value={form.pricePerHour} onChange={handleChange} className="input-base" placeholder="150" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Jogo Ideal</label>
            <select name="gameFormat" value={form.gameFormat} onChange={handleChange} className="input-base">
              {["4x4", "5x5", "6x6", "7x7", "8x8", "9x9", "10x10", "11x11"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Horário Início</label>
            <select name="startHour" value={form.startHour} onChange={handleChange} className="input-base">
              {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-2">Horário Fim</label>
            <select name="endHour" value={form.endHour} onChange={handleChange} className="input-base">
              {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2">Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-base" placeholder="Gramado, iluminação, estacionamento..." />
        </div>

        <PhotoUpload photos={photos} onChange={setPhotos} maxPhotos={3} />

        <div className="flex gap-3 pt-2">
          <Link href="/owner/dashboard" className="btn-secondary flex-1 text-center">Cancelar</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Salvando..." : "Cadastrar Campo"}
          </button>
        </div>
      </form>
    </div>
  );
}
