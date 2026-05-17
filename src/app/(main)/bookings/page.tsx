"use client";

import { useEffect, useState } from "react";

interface BookingItem {
  id: string; date: string; startHour: number; endHour: number;
  totalValue: number; paidValue: number; status: string;
  field: { name: string; city: string };
  participants: { user: { name: string } }[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings").then((r) => r.json()).then((d) => { setBookings(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusConfig: Record<string, { label: string; badge: string }> = {
    PENDING: { label: "Pendente", badge: "badge badge-yellow" },
    CONFIRMED: { label: "Confirmado", badge: "badge badge-green" },
    CANCELLED: { label: "Cancelado", badge: "badge badge-red" },
    COMPLETED: { label: "Concluído", badge: "badge badge-blue" },
    REFUNDED: { label: "Reembolsado", badge: "badge badge-text-3" },
  };

  const activeBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED");
  const pastBookings = bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED" || b.status === "REFUNDED");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-2 tracking-wide uppercase">Meus Agendamentos</h2>
        {bookings.length > 0 && <span className="text-xs text-text-3">{bookings.length} reserva{bookings.length !== 1 ? "s" : ""}</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div></div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
          </div>
          <p className="text-sm text-text-3">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <>
          {activeBookings.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-text-3">PRÓXIMOS</p>
              {activeBookings.map((b) => (
                <div key={b.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-text">{b.field.name}</p>
                      <p className="text-xs text-text-3 mt-1">{new Date(b.date).toLocaleDateString("pt-BR")} • {String(b.startHour).padStart(2, "0")}h às {String(b.endHour).padStart(2, "0")}h</p>
                      <p className="text-xs text-text-3">{b.participants.length} participante{b.participants.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className={statusConfig[b.status]?.badge ?? ""}>{statusConfig[b.status]?.label ?? b.status}</span>
                      <p className="text-xs text-text-3 mt-1">R$ {Number(b.totalValue).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pastBookings.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-text-3">ANTERIORES</p>
              {pastBookings.map((b) => (
                <div key={b.id} className="card p-3.5 opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">{b.field.name}</p>
                      <p className="text-xs text-text-3">{new Date(b.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={statusConfig[b.status]?.badge ?? ""}>{statusConfig[b.status]?.label ?? b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

