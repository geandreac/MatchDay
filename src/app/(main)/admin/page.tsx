"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [reports, setReports] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [tab, setTab] = useState("reports");

  useEffect(() => {
    fetch("/api/admin/reports").then((r) => r.json()).then(setReports).catch(() => {});
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/fields-list").then((r) => r.json()).then((d) => setFields(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const tabs = [
    { id: "reports", label: "Relatórios" },
    { id: "users", label: "Usuários" },
    { id: "fields", label: "Campos" },
  ];

  return (
    <div className="mx-auto max-w-lg px-5 py-8 space-y-6">
      <Link href="/menu" className="text-sm text-primary hover:underline">&larr; Voltar</Link>
      <h1 className="text-2xl font-bold text-text">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-text-3 hover:text-text"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Reports */}
      {tab === "reports" && reports && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Usuários", value: reports.totalUsers, icon: "👥" },
            { label: "Campos", value: reports.totalFields, icon: "🏟️" },
            { label: "Reservas", value: reports.totalBookings, icon: "📅" },
            { label: "Receita", value: `R$ ${Number(reports.totalRevenue).toFixed(0)}`, icon: "💰" },
            { label: "Taxa MatchDay", value: `R$ ${Number(reports.platformFees).toFixed(0)}`, icon: "📊" },
          ].map((item) => (
            <div key={item.label} className="card p-4">
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className="text-lg font-bold text-text">{item.value}</p>
              <p className="text-xs text-text-3">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-2">
          {users.length === 0 ? <p className="text-text-3">Nenhum usuário.</p> : users.map((u) => (
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

      {/* Fields */}
      {tab === "fields" && (
        <div className="space-y-2">
          {fields.length === 0 ? <p className="text-text-3">Nenhum campo.</p> : fields.map((f) => (
            <div key={f.id} className="card p-3">
              <p className="text-sm font-medium text-text">{f.name}</p>
              <p className="text-xs text-text-3">{f.city} • Dono: {f.owner?.name} • {f._count?.bookings} reservas</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
