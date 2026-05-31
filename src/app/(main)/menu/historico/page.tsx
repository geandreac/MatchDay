"use client";

import { useAsync } from "@/lib/use-async";
import { ErrorMessage } from "@/components/error-message";

interface HistoricBooking {
  id: string; date: string; startHour: number; endHour: number;
  totalValue: number; status: string;
  field: { name: string; city: string };
}

export default function Historico() {
  const { data: bookings, loading, error, retry } = useAsync<HistoricBooking[]>(
    async (signal) => {
      const res = await fetch("/api/bookings", { signal });
      if (!res.ok) throw new Error("Erro ao carregar historico");
      return res.json();
    },
  );

  const list = Array.isArray(bookings) ? bookings : [];

  const statusBadge: Record<string, string> = {
    PENDING: "badge badge-yellow", CONFIRMED: "badge badge-green",
    CANCELLED: "badge badge-red", COMPLETED: "badge badge-blue", REFUNDED: "badge badge-text-3",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "Pendente", CONFIRMED: "Confirmado", CANCELLED: "Cancelado", COMPLETED: "Concluido", REFUNDED: "Reembolsado",
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-text">Historico</h2>

      {loading ? (
        <div className="flex justify-center py-12"><div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div></div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p className="text-sm text-text-3">Nenhum historico de reservas.</p>
          <p className="text-xs text-text-3/60">Suas reservas anteriores aparecerao aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <div key={b.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text">{b.field.name}</p>
                  <p className="text-xs text-text-3 mt-0.5">{new Date(b.date).toLocaleDateString("pt-BR")} &bull; {String(b.startHour).padStart(2, "0")}h</p>
                </div>
                <span className={statusBadge[b.status] ?? "badge badge-text-3"}>{statusLabel[b.status] ?? b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
