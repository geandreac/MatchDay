"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fields").then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : [];
      setFields(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalBookings = fields.reduce((acc, f) => acc + (f.bookings?.length || 0), 0);
  const confirmedBookings = fields.reduce((acc, f) => acc + (f.bookings?.filter((b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED").length || 0), 0);
  const totalRevenue = fields.reduce((acc, f) => acc + (f.bookings?.reduce((s: number, b: any) => s + Number(b.paidValue || 0), 0) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text">Dashboard</h2>
          <p className="text-sm text-text-3">Visão geral do seu negócio</p>
        </div>
        <Link href="/owner/cadastro" className="btn-primary text-sm flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Campo
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-text-3 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Campos
          </div>
          <p className="text-2xl font-bold text-text">{fields.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-text-3 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            Partidas
          </div>
          <p className="text-2xl font-bold text-text">{confirmedBookings}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-text-3 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Faturamento
          </div>
          <p className="text-2xl font-bold text-primary">R$ {totalRevenue.toFixed(0)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-text-3 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Taxa MatchDay
          </div>
          <p className="text-2xl font-bold text-secondary">R$ {(totalRevenue * 0.05).toFixed(0)}</p>
        </div>
      </div>

      {/* Fields List */}
      <div>
        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">Seus Campos</h3>
        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-text-3">Nenhum campo cadastrado.</p>
            <Link href="/owner/cadastro" className="btn-primary text-sm">Cadastrar Campo</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => {
              const pendentes = field.bookings?.filter((b: any) => b.status === "PENDING").length || 0;
              return (
                <Link key={field.id} href={`/owner/campos/${field.id}`}
                  className="card p-4 flex items-center gap-3 hover:border-primary/40 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text">{field.name}</p>
                    <p className="text-xs text-text-3 mt-0.5">{field.city} • R$ {field.pricePerHour}/h</p>
                  </div>
                  {pendentes > 0 && (
                    <span className="badge badge-yellow text-xs">{pendentes} pendente{pendentes > 1 ? "s" : ""}</span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
