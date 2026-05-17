"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Field {
  id: string; name: string; city: string;
  pricePerHour: number; startHour: number; endHour: number;
  active: boolean; createdAt: string;
}

export default function OwnerDashboard() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fields").then((r) => r.json()).then((d) => {
      setFields(Array.isArray(d) ? d : []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  const activeCount = fields.filter((f) => f.active).length;

  return (
    <div className="space-y-5 stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-2 tracking-wide uppercase">Meus Campos</h2>
          <p className="text-xs text-text-3 mt-0.5">{activeCount} ativo{activeCount !== 1 ? "s" : ""} de {fields.length}</p>
        </div>
        <Link href="/owner/cadastro" className="btn-primary text-sm flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Campo
        </Link>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-border">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="text-sm text-text-3">Nenhum campo cadastrado.</p>
          <p className="text-xs text-text-3/60 text-center max-w-xs">Cadastre seu primeiro campo para começar a receber reservas.</p>
          <Link href="/owner/cadastro" className="btn-primary mt-2">Cadastrar Campo</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, i) => (
            <Link
              key={field.id}
              href={`/owner/campos/${field.id}`}
              className="card p-4 flex items-center gap-4 animate-fade-in-up group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors truncate">{field.name}</h3>
                <p className="text-sm text-text-3 truncate">{field.city}</p>
                <p className="mt-1 text-xs text-text-3">
                  R$ {field.pricePerHour}/h • {field.startHour}h às {field.endHour}h{field.endHour <= field.startHour ? " (+1)" : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${field.active ? "badge-green" : "badge-text-3"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${field.active ? "bg-primary" : "bg-text-3"}`} />
                  {field.active ? "Ativo" : "Inativo"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

