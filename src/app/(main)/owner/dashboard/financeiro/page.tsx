"use client";

import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ErrorMessage } from "@/components/error-message";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAsync } from "@/lib/use-async";

interface KPI {
  grossRevenue: number;
  netRevenue: number;
  avgTicket: number;
  totalBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  cancelRate: number;
  pendingRate: number;
  platformFees: number;
  refundedRevenue: number;
  paidRevenue: number;
  confirmedBookings: number;
}

interface FinanceData {
  period: { start: string; end: string };
  fields: { id: string; name: string }[];
  kpis: {
    current: KPI;
    previous: KPI;
    variations: Record<string, number>;
  };
  occupancyByField: { fieldId: string; fieldName: string; occupancy: number; revPAH: number }[];
  byDayOfWeek: { dayOfWeek: number; label: string; bookings: number; revenue: number }[];
  byHourRange: { hour: string; bookings: number; revenue: number }[];
  alerts: string[];
}

interface BookingDetail {
  id: string;
  fieldId: string;
  fieldName: string;
  fieldCity: string;
  date: string;
  startHour: number;
  endHour: number;
  totalValue: number;
  paidValue: number;
  status: string;
  owner: { id: string; name: string; email: string };
  contributions: { id: string; userName: string; amount: number; paid: boolean }[];
}

function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function VariationBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-text-3">=</span>;
  const up = value > 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-primary" : "text-danger"}`}>
      {up ? "+" : ""}{value}%
    </span>
  );
}

function MiniBar({ value, max, color = "primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 rounded-full bg-surface-2 overflow-hidden flex-1">
      <div className={`h-full rounded-full bg-${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function KpiCard({ label, value, prev, varLabel }: { label: string; value: string; prev?: string; varLabel?: ReactNode }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-text-3 mb-1">{label}</p>
      <p className="text-lg font-bold text-text">{value}</p>
      {prev && <p className="text-xs text-text-3 mt-0.5">{prev} (período anterior)</p>}
      {varLabel && <p className="text-xs mt-0.5">{varLabel}</p>}
    </div>
  );
}

export default function FinanceDashboard() {
  const [period, setPeriod] = useState("month");
  const [fieldFilter, setFieldFilter] = useState("");
  const [tab, setTab] = useState<"dashboard" | "bookings">("dashboard");

  const fetcher = useCallback(
    async (signal: AbortSignal) => {
      const params = new URLSearchParams({ period });
      if (fieldFilter) params.set("fieldId", fieldFilter);
      const res = await fetch(`/api/owner/finance?${params}`, { signal });
      if (res.status === 403) throw new Error("Acesso negado. Apenas donos de campo.");
      if (!res.ok) throw new Error("Erro ao carregar dados financeiros.");
      return res.json() as Promise<FinanceData>;
    },
    [period, fieldFilter],
  );

  const { data, loading, error, retry } = useAsync<FinanceData>(fetcher);

  const { data: bookings } = useAsync<BookingDetail[]>(
    async (signal) => {
      const res = await fetch("/api/owner/bookings", { signal });
      if (!res.ok) throw new Error("Erro ao carregar reservas.");
      return res.json();
    },
  );

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleCancelBooking() {
    if (!cancellingId) return;
    setLoadingCancel(true);
    const res = await fetch("/api/owner/bookings/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: cancellingId }),
    });
    const d = await res.json();
    setCancelMsg({ text: d.message ?? d.error, ok: res.ok });
    setLoadingCancel(false);
    setCancellingId(null);
    if (res.ok) retry();
  }

  const d = data;
  const k = d?.kpis;
  const cur = k?.current;
  const v = k?.variations ?? {};

  return (
    <div className="space-y-5">
      <ConfirmDialog
        open={!!cancellingId}
        title="Cancelar Reserva"
        message="Tem certeza? Os participantes receberao creditos automaticamente."
        confirmLabel="Sim, Cancelar"
        danger
        loading={loadingCancel}
        onConfirm={handleCancelBooking}
        onCancel={() => setCancellingId(null)}
      />

      <div className="flex items-center gap-3">
        <Link href="/owner/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors text-text-2" aria-label="Voltar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">Dashboard Financeiro</h2>
          <p className="text-sm text-text-3">Visao completa de receita, ocupacao e desempenho</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["day", "week", "month", "year"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-primary text-white" : "bg-surface-2 text-text-2 hover:bg-surface-2/70"}`}>
            {{ day: "Hoje", week: "Semana", month: "Mes", year: "Ano" }[p]}
          </button>
        ))}
        {d?.fields && d.fields.length > 1 && (
          <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className="input-base text-xs py-1.5 w-auto">
            <option value="">Todos os campos</option>
            {d.fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={() => setTab("dashboard")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === "dashboard" ? "bg-primary/10 text-primary" : "text-text-3 hover:text-text"}`}>KPIs</button>
          <button onClick={() => setTab("bookings")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === "bookings" ? "bg-primary/10 text-primary" : "text-text-3 hover:text-text"}`}>Reservas</button>
        </div>
      </div>

      {cancelMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in ${cancelMsg.ok ? "bg-primary/10 border border-primary/20 text-primary" : "bg-danger/10 border border-danger/20 text-danger"}`}
          role={cancelMsg.ok ? "status" : "alert"} aria-live="polite">
          {cancelMsg.ok ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          {cancelMsg.text}
        </div>
      )}

      {d?.alerts && d.alerts.length > 0 && tab === "dashboard" && (
        <div className="space-y-1.5">
          {d.alerts.map((a, i) => (
            <div key={i} className="rounded-xl bg-secondary/10 border border-secondary/20 px-3 py-2 text-xs text-text-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {a}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : !cur || !d || !k ? (
        <div className="flex flex-col items-center gap-4 py-12"><p className="text-text-3">Sem dados no periodo.</p></div>
      ) : tab === "dashboard" ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Receita Bruta" value={`R$ ${formatBRL(cur.grossRevenue)}`} varLabel={<VariationBadge value={v.grossRevenue ?? 0} />} />
            <KpiCard label="Receita Liquida" value={`R$ ${formatBRL(cur.netRevenue)}`} varLabel={<VariationBadge value={v.netRevenue ?? 0} />} />
            <KpiCard label="Ticket Medio" value={`R$ ${formatBRL(cur.avgTicket)}`} varLabel={<VariationBadge value={v.avgTicket ?? 0} />} />
            <KpiCard label="Reservas" value={String(cur.totalBookings)} varLabel={<VariationBadge value={v.bookings ?? 0} />} />
            <KpiCard label="Cancelamentos" value={`${cur.cancelRate}%`} varLabel={<VariationBadge value={v.cancelRate ?? 0} />} />
            <KpiCard label="Pendentes" value={`${cur.pendingRate}%`} />
            <KpiCard label="Taxas (5%)" value={`R$ ${formatBRL(k.current.platformFees)}`} />
            <KpiCard label="Reembolsos" value={`R$ ${formatBRL(k.current.refundedRevenue)}`} />
          </div>

          {/* Occupancy by Field */}
          {d!.occupancyByField.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">Ocupacao por Campo</h3>
              <div className="space-y-3">
                {d!.occupancyByField.map((f) => (
                  <div key={f.fieldId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-2">{f.fieldName}</span>
                      <span className="text-text-3">{f.occupancy}% &bull; RevPAH R$ {formatBRL(f.revPAH)}</span>
                    </div>
                    <MiniBar value={f.occupancy} max={100} color={f.occupancy > 60 ? "primary" : f.occupancy > 30 ? "secondary" : "danger"} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue by Day of Week */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">Receita por Dia da Semana</h3>
            <div className="flex items-end gap-1 h-32">
              {d!.byDayOfWeek.map((day) => {
                const maxRev = Math.max(...d!.byDayOfWeek.map((x) => x.revenue), 1);
                const h = Math.max(4, (day.revenue / maxRev) * 120);
                return (
                  <div key={day.dayOfWeek} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-3">{day.bookings}</span>
                    <div className="w-full rounded-t-md bg-primary/60 hover:bg-primary transition-colors" style={{ height: `${h}px` }} title={`R$ ${formatBRL(day.revenue)}`} />
                    <span className="text-[10px] text-text-3">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue by Hour Range */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">Receita por Faixa Horaria</h3>
            <div className="space-y-2">
              {d!.byHourRange.map((range) => {
                const maxB = Math.max(...d!.byHourRange.map((x) => x.bookings), 1);
                return (
                  <div key={range.hour} className="flex items-center gap-3">
                    <span className="text-xs text-text-3 w-16 shrink-0">{range.hour}</span>
                    <MiniBar value={range.bookings} max={maxB} color="accent" />
                    <span className="text-xs text-text-3 w-20 text-right shrink-0">R$ {formatBRL(range.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Bookings Detail Tab */
        <div className="space-y-3">
          {!bookings || (Array.isArray(bookings) && bookings.length === 0) ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <p className="text-sm text-text-3">Nenhuma reserva encontrada.</p>
            </div>
          ) : (
            Array.isArray(bookings) && bookings.map((b) => {
              const bad: Record<string, string> = {
                PENDING: "badge badge-yellow", CONFIRMED: "badge badge-green",
                CANCELLED: "badge badge-red", COMPLETED: "badge badge-blue", REFUNDED: "badge badge-text-3",
              };
              const st: Record<string, string> = {
                PENDING: "Pendente", CONFIRMED: "Confirmado", CANCELLED: "Cancelado", COMPLETED: "Concluido", REFUNDED: "Reembolsado",
              };
              return (
                <div key={b.id} className="card p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-text">{b.fieldName}</p>
                      <p className="text-xs text-text-3">{b.fieldCity} &bull; {new Date(b.date).toLocaleDateString("pt-BR")} {String(b.startHour).padStart(2, "0")}h-{String(b.endHour).padStart(2, "0")}h</p>
                    </div>
                    <span className={bad[b.status] ?? ""}>{st[b.status] ?? b.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-text-3">Criado por: </span><span className="text-text-2">{b.owner.name}</span></div>
                    <div><span className="text-text-3">Total: </span><span className="text-text-2">R$ {formatBRL(b.totalValue)}</span></div>
                    <div><span className="text-text-3">Pago: </span><span className="text-text-2">R$ {formatBRL(b.paidValue)}</span></div>
                  </div>
                  {b.contributions.length > 0 && (
                    <div className="space-y-1">
                      {b.contributions.map((c) => (
                        <div key={c.id} className="flex justify-between text-xs">
                          <span className="text-text-2">{c.userName}</span>
                          <span className={c.paid ? "text-primary/70" : "text-text-3"}>R$ {formatBRL(c.amount)} {c.paid ? "✓" : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                    <button onClick={() => setCancellingId(b.id)} className="text-xs text-danger hover:underline">Cancelar reserva</button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
