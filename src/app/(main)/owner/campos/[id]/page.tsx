"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAsync } from "@/lib/use-async";
import { ErrorMessage } from "@/components/error-message";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface FieldData {
  id: string; name: string; address: string; city: string; state?: string;
  description?: string; capacity: number; gameFormat?: string | null; pricePerHour: number;
  startHour: number; endHour: number; active: boolean;
  bookings: { id: string; date: string; status: string; totalValue: number; paidValue: number; }[];
}

export default function DetalhesCampo() {
  const params = useParams();
  const router = useRouter();
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkResult, setLinkResult] = useState<{ link: string; id: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({ date: "", startHour: "19", endHour: "22" });
  const [showConfirmToggle, setShowConfirmToggle] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [shake, setShake] = useState(false);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  const fetchField = useCallback(
    async (signal: AbortSignal) => {
      const id = (await params).id as string;
      const res = await fetch(`/api/fields/${id}`, { signal });
      if (!res.ok) throw new Error("Campo nao encontrado");
      const data = await res.json();
      setBookingForm((prev) => ({
        ...prev,
        startHour: String(data.startHour),
        endHour: String(Math.min(data.startHour + 2, data.endHour > data.startHour ? data.endHour : 24)),
      }));
      return data as FieldData;
    },
    [params],
  );

  const { data: field, loading, error, retry } = useAsync<FieldData>(fetchField);

  async function handleGenerateLink(e: React.FormEvent) {
    e.preventDefault(); if (!field) return;
    setGeneratingLink(true); setLinkResult(null);
    try {
      const res = await fetch(`/api/fields/${field.id}/share-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkResult({ link: data.shareLink, id: data.shareLinkId });
      }
    } catch {}
    setGeneratingLink(false);
  }

  async function handleToggleConfirm() {
    setShowConfirmToggle(true);
  }

  async function handleToggleActive() {
    if (!field) return;
    setToggling(true);
    await fetch(`/api/fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !field.active }),
    });
    setToggling(false);
    setShowConfirmToggle(false);
    retry();
  }

  async function handleDelete() {
    if (!field) return;
    if (confirmText !== "EXCLUIR") {
      setDeleteError('Digite "EXCLUIR" exatamente para confirmar.');
      setShake(true);
      try { navigator.vibrate?.(120); } catch {}
      setTimeout(() => setShake(false), 500);
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/fields/${field.id}`, { method: "DELETE" });
    } catch {
      setDeleting(false);
      setDeleteError("Erro ao excluir. Tente novamente.");
      return;
    }
    setDeleting(false);
    setShowConfirmDelete(false);
    router.push("/owner/dashboard");
    router.refresh();
  }

  function openDeleteModal() {
    setConfirmText("");
    setDeleteError("");
    setShake(false);
    setShowConfirmDelete(true);
    setTimeout(() => confirmInputRef.current?.focus(), 100);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && showConfirmDelete) {
        setShowConfirmDelete(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showConfirmDelete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <ErrorMessage message={error} onRetry={retry} />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-text-3">Campo nao encontrado.</p>
        <Link href="/owner/dashboard" className="btn-primary">Voltar</Link>
      </div>
    );
  }

  const statusBadge: Record<string, string> = {
    PENDING: "badge badge-yellow", CONFIRMED: "badge badge-green",
    CANCELLED: "badge badge-red", COMPLETED: "badge badge-blue", REFUNDED: "badge badge-text-3",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "Pendente", CONFIRMED: "Confirmado", CANCELLED: "Cancelado",
    COMPLETED: "Concluido", REFUNDED: "Reembolsado",
  };

  return (
    <div className="space-y-5 stagger">
      <ConfirmDialog
        open={showConfirmToggle}
        title={field.active ? "Desativar Campo" : "Ativar Campo"}
        message={field.active
          ? "Ao desativar, o campo nao recebera novas reservas. As reservas existentes nao serao afetadas. Deseja continuar?"
          : "Ao ativar, o campo voltara a receber reservas."}
        confirmLabel={field.active ? "Desativar" : "Ativar"}
        danger={field.active}
        loading={toggling}
        onConfirm={handleToggleActive}
        onCancel={() => setShowConfirmToggle(false)}
      />

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby={deleteError ? "delete-error" : "delete-desc"}>
          <div className={`relative bg-surface border border-danger/20 rounded-t-2xl sm:rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up space-y-4 ${shake ? "animate-shake" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <div>
                <h3 id="delete-title" className="text-lg font-bold text-text">Excluir Campo</h3>
                <p className="text-sm text-text-3">Esta acao nao pode ser desfeita.</p>
              </div>
            </div>

            <p id="delete-desc" className="text-sm text-text-2">Todas as reservas, fotos e dados de <strong className="text-text">{field.name}</strong> serao permanentemente removidos.</p>

            <div>
              <label className="text-xs font-medium text-text-2 mb-1.5 block" htmlFor="confirm-delete">
                Digite <strong className="text-danger">EXCLUIR</strong> para confirmar
              </label>
              <input
                ref={confirmInputRef}
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => { setConfirmText(e.target.value); setDeleteError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && confirmText === "EXCLUIR") handleDelete(); }}
                className={`input-base text-sm font-mono tracking-wider transition-colors ${
                  confirmText === "EXCLUIR" ? "border-primary ring-2 ring-primary/20" : deleteError ? "border-danger ring-2 ring-danger/20" : ""
                }`}
                placeholder="EXCLUIR"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!deleteError}
                aria-describedby={deleteError ? "delete-error" : undefined}
              />
              <p className="text-xs text-text-3 mt-1.5">
                {confirmText.length > 0 && confirmText !== "EXCLUIR"
                  ? `${confirmText.length}/7 digitado — precisa ser exatamente "EXCLUIR"`
                  : confirmText === "EXCLUIR"
                  ? "Pronto! Clique em Excluir Campo para confirmar."
                  : "Digite a palavra acima em letras maiusculas"}
              </p>
              {deleteError && (
                <p id="delete-error" className="text-xs text-danger mt-1.5 animate-fade-in flex items-center gap-1" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowConfirmDelete(false)} disabled={deleting} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== "EXCLUIR"}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                  confirmText === "EXCLUIR"
                    ? "bg-danger text-white hover:bg-danger/80 active:scale-95 shadow-lg shadow-danger/20"
                    : "bg-surface-2 text-text-3 cursor-not-allowed"
                }`}
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Excluindo...
                  </span>
                ) : "Excluir Campo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-text">{field.name}</h2>
          <p className="text-sm text-text-3">{field.city}{field.state ? `, ${field.state}` : ""}</p>
        </div>
        <span className={`ml-auto badge ${field.active ? "badge-green" : "badge-text-3"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${field.active ? "bg-primary" : "bg-text-3"}`} />
          {field.active ? "Ativo" : "Inativo"}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Preco", value: `R$ ${field.pricePerHour}/h`, icon: DollarIcon, color: "text-primary" },
          { label: "Horario", value: `${field.startHour}h as ${field.endHour}h`, icon: ClockIcon2, color: "text-accent" },
          { label: "Jogo Ideal", value: field.gameFormat ?? `${field.capacity} jogadores`, icon: UsersIcon2, color: "text-secondary" },
          { label: "Endereco", value: field.address, icon: MapPinIcon, color: "text-primary" },
        ].map((info) => (
          <div key={info.label} className="card p-3.5">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-current/5 ${info.color}`}><info.icon /></div>
            <p className="text-xs text-text-3">{info.label}</p>
            <p className="text-sm font-semibold text-text mt-0.5 truncate">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Toggle Active & Edit & Delete */}
      <div className="flex gap-3">
        <button onClick={handleToggleConfirm}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all duration-300 ${
            field.active ? "btn-secondary text-text-3" : "btn-primary"
          }`}>
          {field.active ? "Desativar" : "Ativar"}
        </button>
        <Link href={`/owner/editar/${field.id}`}
          className="flex-1 rounded-xl py-3 text-sm font-medium transition-all duration-300 text-center bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20">
          Editar
        </Link>
        <button onClick={openDeleteModal}
          className="rounded-xl py-3 px-4 text-sm font-medium transition-all duration-300 bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Excluir
        </button>
      </div>

      {/* Generate Link */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-4">Gerar Link de Reserva</h3>
        <form onSubmit={handleGenerateLink} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-3" htmlFor="date">Data</label>
            <input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={bookingForm.date} onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))} className="input-base" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-3">Inicio</label>
              <select value={bookingForm.startHour} onChange={(e) => setBookingForm((p) => ({ ...p, startHour: e.target.value }))} className="input-base">
                {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-3">Fim</label>
              <select value={bookingForm.endHour} onChange={(e) => setBookingForm((p) => ({ ...p, endHour: e.target.value }))} className="input-base">
                {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>))}
              </select>
            </div>
          </div>

          {linkResult && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 animate-fade-in-up space-y-2">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-sm font-medium text-primary">Link gerado com sucesso!</p>
              </div>
              <p className="text-xs text-text-3 break-all bg-surface-2 rounded-lg p-2.5 select-all">{linkResult.link}</p>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(linkResult.link)}
                  type="button" className="text-xs font-medium text-primary hover:underline">Copiar link</button>
                <span className="text-text-3 text-xs">&bull;</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Jogue comigo! Reserve seu lugar: ${linkResult.link}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-green-400 hover:underline"
                >
                  Compartilhar no WhatsApp
                </a>
              </div>
            </div>
          )}

          <button type="submit" disabled={generatingLink} className="btn-primary w-full">
            {generatingLink ? "Gerando..." : "Gerar Link de Reserva"}
          </button>
        </form>
      </div>

      {/* Recent Bookings */}
      <div>
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">Ultimas Reservas</h3>
        {field.bookings.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-sm text-text-3">Nenhuma reserva ainda.</p>
            <p className="text-xs text-text-3/60 mt-1">Gere um link de reserva e compartilhe com os jogadores!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {field.bookings.slice(0, 10).map((b) => (
              <div key={b.id} className="card p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text">{new Date(b.date).toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-text-3 mt-0.5">R$ {Number(b.totalValue).toFixed(2)}</p>
                </div>
                <span className={statusBadge[b.status] ?? "badge badge-text-3"}>{statusLabel[b.status] ?? b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DollarIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>); }
function ClockIcon2() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>); }
function UsersIcon2() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>); }
function MapPinIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>); }
