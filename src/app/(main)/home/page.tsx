"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LastBookingItem {
  field?: { name?: string };
  date: string;
  status: string;
}

interface FavoriteFieldItem {
  name: string;
  city: string;
}

export default function HomePage() {
  const [lastBooking, setLastBooking] = useState<LastBookingItem | null>(null);
  const [favoriteField, setFavoriteField] = useState<FavoriteFieldItem | null>(null);
  const [stats, setStats] = useState({ campos: 0, partidas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()).then((d) => {
        if (Array.isArray(d) && d.length > 0) setLastBooking(d[0]);
      }),
      fetch("/api/favorites").then((r) => r.json()).then((d) => {
        if (Array.isArray(d) && d.length > 0) setFavoriteField(d[0]?.field);
      }),
      fetch("/api/fields/search").then((r) => r.json()).then((d) => {
        if (Array.isArray(d)) setStats((p) => ({ ...p, campos: d.length }));
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-sm text-text-3">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <Link href="/search" className="relative group block" aria-label="Buscar campos de futebol">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 group-hover:text-primary transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <div className="input-base text-text-3" style={{ paddingLeft: "44px" }}>Buscar campo...</div>
      </Link>

      {/* Stats */}
      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "Campos", value: String(stats.campos), icon: MapIcon, color: "text-primary" },
          { label: "Partidas", value: String(stats.partidas || (lastBooking ? "1" : "0")), icon: BallIcon, color: "text-secondary" },
          { label: "Favoritos", value: String(favoriteField ? "1" : "0"), icon: HeartSmIcon, color: "text-danger" },
        ].map((stat) => (
          <div key={stat.label} className="card p-3.5 text-center">
            <dt className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-current/5 ${stat.color}`}><stat.icon /></dt>
            <dd className="text-lg font-bold text-text">{stat.value}</dd>
            <dd className="text-xs text-text-3">{stat.label}</dd>
          </div>
        ))}
      </dl>

      {/* Last Booking */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-2 tracking-wide uppercase">Último Agendamento</h2>
          <Link href="/bookings" className="text-xs font-medium text-primary hover:underline">Ver todos</Link>
        </div>
        <div className="card p-5">
          {lastBooking ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p className="font-semibold text-text">{lastBooking.field?.name ?? "Reserva"}</p>
                <p className="text-xs text-text-3 mt-0.5">{new Date(lastBooking.date).toLocaleDateString("pt-BR")}</p>
              </div>
              <span className="ml-auto">
                {lastBooking.status === "PENDING" && <span className="badge badge-yellow">Pendente</span>}
                {lastBooking.status === "CONFIRMED" && <span className="badge badge-green">Confirmado</span>}
                {lastBooking.status === "COMPLETED" && <span className="badge badge-blue">Concluído</span>}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              </div>
              <p className="text-sm text-text-3">Nenhum agendamento recente.</p>
            </div>
          )}
        </div>
      </section>

      {/* Favorite Field */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-2 tracking-wide uppercase">Campo Favorito</h2>
          <Link href="/search" className="text-xs font-medium text-primary hover:underline">Buscar</Link>
        </div>
        <div className="card p-5">
          {favoriteField ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="text-secondary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <p className="font-semibold text-text">{favoriteField.name}</p>
                <p className="text-xs text-text-3">{favoriteField.city}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <p className="text-sm text-text-3">Nenhum campo favoritado.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MapIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>); }
function BallIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>); }
function HeartSmIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>); }

