"use client";

import { useState } from "react";
import Link from "next/link";
import { useAsync } from "@/lib/use-async";
import { ErrorMessage } from "@/components/error-message";

interface AdminReports {
  totalUsers: number;
  totalFields: number;
  totalBookings: number;
  totalRevenue: number;
  platformFees: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminField {
  id: string;
  name: string;
  city: string;
  owner?: { name: string };
  _count?: { bookings: number };
}

export default function AdminPage() {
  const [tab, setTab] = useState("reports");

  const { data: reports, loading: loadingRep, error: errorRep, retry: retryRep } = useAsync<AdminReports>(
    async (signal) => {
      const res = await fetch("/api/admin/reports", { signal });
      if (!res.ok) throw new Error("Acesso negado ou erro no servidor");
      return res.json();
    },
  );

  const { data: users, loading: loadingUsr, error: errorUsr, retry: retryUsr } = useAsync<AdminUser[]>(
    async (signal) => {
      const res = await fetch("/api/admin/users", { signal });
      if (!res.ok) throw new Error("Acesso negado ou erro no servidor");
      return res.json();
    },
  );

  const { data: fields, loading: loadingFld, error: errorFld, retry: retryFld } = useAsync<AdminField[]>(
    async (signal) => {
      const res = await fetch("/api/admin/fields-list", { signal });
      if (!res.ok) throw new Error("Acesso negado ou erro no servidor");
      return res.json();
    },
  );

  const tabs = [
    { id: "reports", label: "Relatorios" },
    { id: "users", label: "Usuarios" },
    { id: "fields", label: "Campos" },
  ];

  const userList = Array.isArray(users) ? users : [];
  const fieldList = Array.isArray(fields) ? fields : [];

  return (
    <div className="mx-auto max-w-lg px-5 py-8 space-y-6">
      <Link href="/menu" className="text-sm text-primary hover:underline">&larr; Voltar</Link>
      <h1 className="text-2xl font-bold text-text">Admin</h1>

      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-text-3 hover:text-text"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <>
          {loadingRep ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
          ) : errorRep ? (
            <ErrorMessage message={errorRep} onRetry={retryRep} />
          ) : reports && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Usuarios", value: reports.totalUsers },
                { label: "Campos", value: reports.totalFields },
                { label: "Reservas", value: reports.totalBookings },
                { label: "Receita", value: `R$ ${Number(reports.totalRevenue).toFixed(0)}` },
                { label: "Taxa MatchDay", value: `R$ ${Number(reports.platformFees).toFixed(0)}` },
              ].map((item) => (
                <div key={item.label} className="card p-4">
                  <p className="text-lg font-bold text-text">{item.value}</p>
                  <p className="text-xs text-text-3">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "users" && (
        <>
          {loadingUsr ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
          ) : errorUsr ? (
            <ErrorMessage message={errorUsr} onRetry={retryUsr} />
          ) : userList.length === 0 ? (
            <p className="text-text-3 text-center py-8">Nenhum usuario.</p>
          ) : (
            <div className="space-y-2">
              {userList.map((u) => (
                <div key={u.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{u.name}</p>
                    <p className="text-xs text-text-3">{u.email}</p>
                  </div>
                  <span className={`badge ${u.role === "ADMIN" ? "badge-green" : u.role === "FIELD_OWNER" ? "badge-yellow" : "badge-blue"}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "fields" && (
        <>
          {loadingFld ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
          ) : errorFld ? (
            <ErrorMessage message={errorFld} onRetry={retryFld} />
          ) : fieldList.length === 0 ? (
            <p className="text-text-3 text-center py-8">Nenhum campo.</p>
          ) : (
            <div className="space-y-2">
              {fieldList.map((f) => (
                <div key={f.id} className="card p-3">
                  <p className="text-sm font-medium text-text">{f.name}</p>
                  <p className="text-xs text-text-3">{f.city} &bull; Dono: {f.owner?.name} &bull; {f._count?.bookings} reservas</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
