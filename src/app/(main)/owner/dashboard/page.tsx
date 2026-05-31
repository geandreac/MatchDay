"use client";

import Link from "next/link";
import { useAsync } from "@/lib/use-async";
import { ErrorMessage } from "@/components/error-message";

interface OwnerField {
  id: string;
  name: string;
  city: string;
  address: string;
  pricePerHour: number;
  startHour: number;
  endHour: number;
  active: boolean;
  bookings?: OwnerBooking[];
}

interface OwnerBooking {
  id: string;
  date: string;
  status: string;
  totalValue: number;
  paidValue: number;
}

export default function OwnerDashboard() {
  const { data: fields, loading, error, retry } = useAsync<OwnerField[]>(
    async (signal) => {
      const res = await fetch("/api/fields", { signal });
      if (!res.ok) throw new Error("Erro ao carregar campos");
      return res.json();
    },
  );

  const list = Array.isArray(fields) ? fields : [];

  const confirmedBookings = list.reduce(
    (acc: number, f: OwnerField) =>
      acc +
      (f.bookings?.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length || 0),
    0,
  );
  const totalRevenue = list.reduce(
    (acc: number, f: OwnerField) =>
      acc + (f.bookings?.reduce((s: number, b: OwnerBooking) => s + Number(b.paidValue || 0), 0) || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retry} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Meus Campos</h2>
        <Link href="/owner/cadastro" className="btn-primary text-sm">Novo Campo</Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3.5 text-center">
          <p className="text-lg font-bold text-primary">{list.length}</p>
          <p className="text-xs text-text-3">Campos</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="text-lg font-bold text-secondary">{confirmedBookings}</p>
          <p className="text-xs text-text-3">Partidas</p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="text-lg font-bold text-accent">R$ {totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-text-3">Faturamento</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/owner/bookings" className="card flex-1 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Reservas</p>
            <p className="text-xs text-text-3">Gerencie as reservas dos seus campos</p>
          </div>
        </Link>
      </div>

      <div className="card p-4 text-sm text-text-2">
        <p><span className="font-medium">Taxa MatchDay:</span> 5% por reserva</p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-sm text-text-3">Nenhum campo cadastrado.</p>
          <Link href="/owner/cadastro" className="btn-primary text-sm">Cadastrar Campo</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((f) => (
            <Link key={f.id} href={`/owner/campos/${f.id}`} className="card block p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text">{f.name}</p>
                  <p className="text-xs text-text-3 mt-0.5">{f.city} &bull; R$ {f.pricePerHour}/h</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text">{f.bookings?.filter((b) => b.status === "PENDING").length || 0} pendente(s)</p>
                  <span className={`badge mt-1 ${f.active ? "badge-green" : "badge-red"}`}>{f.active ? "Ativo" : "Inativo"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
