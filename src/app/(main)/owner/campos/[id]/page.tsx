"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface FieldData {
  id: string; name: string; address: string; city: string; state?: string;
  description?: string; capacity: number; pricePerHour: number;
  startHour: number; endHour: number; active: boolean;
  bookings: { id: string; date: string; status: string; totalValue: number; paidValue: number; }[];
}

export default function DetalhesCampo() {
  const params = useParams();
  const [field, setField] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkResult, setLinkResult] = useState<{ link: string; id: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({ date: "", startHour: "19", endHour: "22" });

  useEffect(() => {
    (async () => {
      const id = (await params).id;
      const res = await fetch(`/api/fields/${id}`);
      if (res.ok) {
        const data = await res.json();
        setField(data);
        setBookingForm((prev) => ({
          ...prev,
          startHour: String(data.startHour),
          endHour: String(Math.min(data.startHour + 2, data.endHour > data.startHour ? data.endHour : 24)),
        }));
      }
      setLoading(false);
    })();
  }, [params]);

  async function handleGenerateLink(e: React.FormEvent) {
    e.preventDefault(); if (!field) return;
    setGeneratingLink(true); setLinkResult(null);
    try {
      const res = await fetch(`/api/fields/${field.id}/share-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkResult({ link: data.shareLink, id: data.shareLinkId });
      }
    } catch {}
    setGeneratingLink(false);
  }

  async function toggleActive() {
    if (!field) return;
    await fetch(`/api/fields/${field.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !field.active }) });
    setField((prev) => prev ? { ...prev, active: !prev.active } : null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center"><div className="h-4 w-4 rounded-full bg-primary" /></div>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-text-3">Campo não encontrado.</p>
        <Link href="/owner/dashboard" className="btn-primary">Voltar</Link>
      </div>
    );
  }

  const statusBadge: Record<string, string> = {
    PENDING: "badge badge-yellow", CONFIRMED: "badge badge-green",
    CANCELLED: "badge badge-red", COMPLETED: "badge badge-blue", REFUNDED: "badge badge-text-3",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "Pendente", CONFIRMED: "Confirmado", CANCELLED: "Cancelado",
    COMPLETED: "Concluído", REFUNDED: "Reembolsado",
  };

  return (
    <div className="space-y-5 stagger">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">{field.name}</h2>
          <p className="text-sm text-text-3">{field.city}{field.state ? `, ${field.state}` : ""}</p>
        </div>
        <span className={`ml-auto badge ${field.active ? "badge-green" : "badge-text-3"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${field.active ? "bg-primary" : "bg-text-3"}`} />
          {field.active ? "Ativo" : "Inativo"}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Preço", value: `R$ ${field.pricePerHour}/h`, icon: DollarIcon, color: "text-primary" },
          { label: "Horário", value: `${field.startHour}h às ${field.endHour}h`, icon: ClockIcon2, color: "text-accent" },
          { label: "Capacidade", value: `${field.capacity} jogadores`, icon: UsersIcon2, color: "text-secondary" },
          { label: "Endereço", value: field.address, icon: MapPinIcon, color: "text-primary" },
        ].map((info) => (
          <div key={info.label} className="card p-3.5">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-current/5 ${info.color}`}><info.icon /></div>
            <p className="text-xs text-text-3">{info.label}</p>
            <p className="text-sm font-semibold text-text mt-0.5 truncate">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Toggle Active & Edit */}
      <div className="flex gap-3">
        <button onClick={toggleActive}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all duration-300 ${
            field.active ? "btn-secondary text-text-3" : "btn-primary"
          }`}>
          {field.active ? "Desativar" : "Ativar"}
        </button>
        <Link href={`/owner/editar/${field.id}`}
          className="flex-1 rounded-xl py-3 text-sm font-medium transition-all duration-300 text-center bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20">
          Editar Campo
        </Link>
      </div>

      {/* Generate Link */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-4">Gerar Link de Reserva</h3>
        <form onSubmit={handleGenerateLink} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-3" htmlFor="date">Data</label>
            <input id="date" type="date" value={bookingForm.date} onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))} className="input-base" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-3">Início</label>
              <select value={bookingForm.startHour} onChange={(e) => setBookingForm((p) => ({ ...p, startHour: e.target.value }))} className="input-base">
                {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-3">Fim</label>
              <select value={bookingForm.endHour} onChange={(e) => setBookingForm((p) => ({ ...p, endHour: e.target.value }))} className="input-base">
                {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
              </select>
            </div>
          </div>

          {linkResult && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 animate-fade-in-up space-y-2">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-sm font-medium text-primary">Link gerado com sucesso!</p>
              </div>
              <p className="text-xs text-text-3 break-all bg-surface-2 rounded-lg p-2.5 select-all">{linkResult.link}</p>
              <button onClick={() => navigator.clipboard.writeText(linkResult.link)}
                className="text-xs font-medium text-primary hover:underline">Copiar link</button>
            </div>
          )}

          <button type="submit" disabled={generatingLink} className="btn-primary w-full">
            {generatingLink ? "Gerando..." : "Gerar Link de Reserva"}
          </button>
        </form>
      </div>

      {/* Recent Bookings */}
      <div>
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">Últimas Reservas</h3>
        {field.bookings.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-sm text-text-3">Nenhuma reserva ainda.</p>
            <p className="text-xs text-text-3/60 mt-1">Gere um link de reserva e compartilhe com os jogadores!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {field.bookings.slice(0, 10).map((b) => (
              <div key={b.id} className="card p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text">{new Date(b.date).toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-text-3 mt-0.5">R$ {Number(b.totalValue).toFixed(2)}</p>
                </div>
                <span className={statusBadge[b.status] ?? "badge badge-text-3"}>{statusLabel[b.status] ?? b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DollarIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>); }
function ClockIcon2() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>); }
function UsersIcon2() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>); }
function MapPinIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>); }
