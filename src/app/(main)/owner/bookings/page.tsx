"use client";

import { useState } from "react";
import Link from "next/link";
import { useAsync } from "@/lib/use-async";
import { ErrorMessage } from "@/components/error-message";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface BookingItem {
  id: string;
  fieldId: string;
  fieldName: string;
  fieldCity: string;
  date: string;
  startHour: number;
  endHour: number;
  hours: number;
  totalValue: number;
  paidValue: number;
  platformFee: number;
  status: string;
  shareLinkId: string;
  paymentDeadline: string;
  owner: { id: string; name: string; email: string };
  participants: { id: string; name: string; shareValue: number; hasPaid: boolean }[];
  contributions: { id: string; userId: string; userName: string; amount: number; paid: boolean; paidAt: string | null }[];
}

export default function OwnerBookingsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const { data: bookings, loading, error, retry } = useAsync<BookingItem[]>(
    async (signal) => {
      const res = await fetch("/api/owner/bookings", { signal });
      if (res.status === 403) throw new Error("Apenas donos de campo podem acessar esta pagina.");
      if (!res.ok) throw new Error("Erro ao carregar reservas.");
      return res.json();
    },
  );

  const list = Array.isArray(bookings) ? bookings : [];

  const filtered = filter === "all"
    ? list
    : list.filter((b) => b.status === filter);

  async function handleCancel() {
    if (!cancellingId) return;
    setLoadingCancel(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/owner/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: cancellingId, motivo: "Cancelado pelo dono" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error ?? "Erro ao cancelar.");
      } else {
        setCancelSuccess(`Reserva cancelada com sucesso.`);
        setTimeout(() => setCancelSuccess(null), 4000);
        retry();
      }
    } catch {
      setCancelError("Erro de conexao.");
    }
    setLoadingCancel(false);
    setCancellingId(null);
  }

  const statusLabel: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Concluido",
    REFUNDED: "Reembolsado",
  };
  const statusBadge: Record<string, string> = {
    PENDING: "badge badge-yellow",
    CONFIRMED: "badge badge-green",
    CANCELLED: "badge badge-red",
    COMPLETED: "badge badge-blue",
    REFUNDED: "badge badge-text-3",
  };

  return (
    <div className="space-y-5">
      <ConfirmDialog
        open={!!cancellingId}
        title="Cancelar Reserva"
        message="Tem certeza que deseja cancelar esta reserva? Os participantes receberao creditos automaticamente."
        confirmLabel="Sim, Cancelar"
        danger
        loading={loadingCancel}
        onConfirm={handleCancel}
        onCancel={() => setCancellingId(null)}
      />

      <div className="flex items-center gap-3">
        <Link href="/owner/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors text-text-2" aria-label="Voltar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">Reservas dos Meus Campos</h2>
          <p className="text-sm text-text-3">Gerencie todas as reservas dos seus campos</p>
        </div>
      </div>

      {cancelSuccess && (
        <div className="glass rounded-xl px-4 py-3 text-sm text-primary border border-primary/20 animate-fade-in flex items-center gap-2" role="status" aria-live="polite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          {cancelSuccess}
        </div>
      )}
      {cancelError && (
        <div className="glass rounded-xl px-4 py-3 text-sm text-danger border border-danger/20 animate-fade-in flex items-center gap-2" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {cancelError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Todas" },
          { id: "PENDING", label: "Pendentes" },
          { id: "CONFIRMED", label: "Confirmadas" },
          { id: "COMPLETED", label: "Concluidas" },
          { id: "CANCELLED", label: "Canceladas" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors shrink-0 ${filter === f.id ? "bg-primary text-white" : "bg-surface-2 text-text-2 hover:bg-surface-2/70"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          </div>
          <p className="text-sm text-text-3">Nenhuma reserva encontrada.</p>
          {filter !== "all" && <button onClick={() => setFilter("all")} className="text-xs text-primary hover:underline">Ver todas</button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-text">{b.fieldName}</p>
                  <p className="text-xs text-text-3 mt-0.5">
                    {new Date(b.date).toLocaleDateString("pt-BR")} &bull; {String(b.startHour).padStart(2, "0")}h - {String(b.endHour).padStart(2, "0")}h
                  </p>
                </div>
                <span className={`${statusBadge[b.status] ?? "badge badge-text-3"} shrink-0`}>{statusLabel[b.status] ?? b.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-3">Criado por: </span>
                  <span className="text-text-2">{b.owner.name}</span>
                </div>
                <div>
                  <span className="text-text-3">Valor total: </span>
                  <span className="text-text-2">R$ {b.totalValue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-text-3">Pago: </span>
                  <span className="text-text-2">R$ {b.paidValue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-text-3">Taxa (5%): </span>
                  <span className="text-text-2">R$ {b.platformFee.toFixed(2)}</span>
                </div>
              </div>

              {b.participants.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-3 mb-1.5">Jogadores ({b.participants.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.participants.map((p) => (
                      <span key={p.id} className={`text-xs rounded-full px-2.5 py-1 ${p.hasPaid ? "bg-primary/10 text-primary border border-primary/20" : "bg-surface-2 text-text-3 border border-border"}`}>
                        {p.name} {p.hasPaid ? "✓" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {b.contributions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-3 mb-1.5">Pagamentos</p>
                  <div className="space-y-1">
                    {b.contributions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <span className="text-text-2">{c.userName}</span>
                        <span className={c.paid ? "text-primary/70" : "text-text-3"}>
                          R$ {c.amount.toFixed(2)} {c.paid ? "(pago)" : "(pendente)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                <button
                  onClick={() => setCancellingId(b.id)}
                  className="text-xs font-medium text-danger hover:underline mt-1"
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
