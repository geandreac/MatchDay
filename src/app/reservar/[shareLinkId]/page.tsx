"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

interface Contribution {
  id: string; amount: number; paid: boolean; paidAt: string | null;
  pixCode: string | null; pixQrCode: string | null;
  user: { id: string; name: string };
}

interface BookingData {
  id: string; field: { name: string; address: string; city: string; pricePerHour: number };
  user: { name: string };
  date: string; startHour: number; endHour: number;
  totalValue: number; paidValue: number; hours: number;
  platformFee: number; status: string;
  shareLink: string; shareLinkId: string; paymentDeadline: string;
  participants: { id: string; hasPaid: boolean; user: { id: string; name: string; image: string | null } }[];
  contributions: Contribution[];
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ReservarPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [payValue, setPayValue] = useState("");
  const [showPix, setShowPix] = useState(false);
  const [currentPix, setCurrentPix] = useState<{ qrCode: string; qrCodeBase64: string | null } | null>(null);
  const [lastContributionId, setLastContributionId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [useCredits, setUseCredits] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      const id = (await params).shareLinkId;
      const res = await fetch(`/api/reservar/${id}`);
      if (res.ok) setBooking(await res.json());

      const cr = await fetch("/api/credits");
      if (cr.ok) { const d = await cr.json(); setCreditBalance(d.total); }
    } catch {
      setError("Erro ao carregar reserva.");
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!session) { signIn(); return; }
    if (!booking) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/reservar/${booking.shareLinkId}/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setMsg({ text: "Voce entrou na reserva!", type: "success" });
        load();
      } else {
        const data = await res.json();
        setMsg({ text: data.error ?? "Erro ao participar.", type: "error" });
      }
    } catch {
      setMsg({ text: "Erro de conexao.", type: "error" });
    }
    setJoining(false);
  }

  function handlePayValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    const value = (parseInt(raw) || 0) / 100;
    if (value > (remaining() || 0)) {
      setPayValue(remaining()?.toString() ?? "");
    } else {
      setPayValue(value > 0 ? value.toString() : "");
    }
  }

  async function handlePay() {
    if (!session) { signIn(); return; }
    if (!booking || !payValue) return;
    const amount = parseFloat(payValue);
    if (amount < 0.01 || amount > remaining()) return;

    setPaying(true); setMsg(null);
    try {
      const res = await fetch("/api/pix/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, amount, useCredits }),
      });
      const data = await res.json();

      if (res.ok && data.pix) {
        setCurrentPix({ qrCode: data.pix.qrCode, qrCodeBase64: data.pix.qrCodeBase64 });
        setShowPix(true);
        setLastContributionId(data.contribution.id);
        setMsg({ text: "PIX gerado! Escaneie o QR Code para pagar.", type: "success" });
        load();
      } else if (res.ok && data.paid) {
        setMsg({ text: "Pagamento confirmado com creditos!", type: "success" });
        setCreditBalance((prev) => prev - amount);
        load();
      } else {
        setMsg({ text: data.error || "Erro ao gerar PIX.", type: "error" });
      }
    } catch {
      setMsg({ text: "Erro de conexao.", type: "error" });
    }
    setPaying(false);
  }

  function remaining() { return booking ? Number(booking.totalValue) - Number(booking.paidValue) : 0; }

  function copyLink() {
    if (booking?.shareLink) {
      navigator.clipboard.writeText(booking.shareLink);
      setMsg({ text: "Link copiado!", type: "success" });
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true); setMsg(null);
    const res = await fetch("/api/reservar/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id }),
    });
    const data = await res.json();
    setMsg({ text: data.message || data.error, type: res.ok ? "success" : "error" });
    if (res.ok) { load(); setShowCancelConfirm(false); }
    setCancelling(false);
  }

  if (loading) return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
        <p className="text-sm text-text-3 animate-pulse">Carregando reserva...</p>
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-border">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>
      </div>
      <p className="text-text-3">{error ?? "Reserva nao encontrada."}</p>
      <button onClick={() => window.history.back()} className="btn-secondary text-sm">Voltar</button>
    </div>
  );

  const progresso = booking.totalValue > 0 ? Math.round((booking.paidValue / booking.totalValue) * 100) : 0;
  const dia = new Date(booking.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const isJoined = session && booking.participants.some((p) => p.user.id === session.user?.id);
  const rem = remaining();

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-5 pt-12 pb-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 border border-primary/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{booking.field.name}</h1>
              <p className="text-sm text-text-3">{dia} &bull; {String(booking.startHour).padStart(2, "0")}h</p>
            </div>
          </div>
          {booking.status === "CONFIRMED" && <span className="badge badge-green" role="status">Confirmado</span>}
          {booking.status === "PENDING" && <span className="badge badge-yellow" role="status">Aguardando pagamentos</span>}
          {booking.status === "CANCELLED" && <span className="badge badge-red" role="status">Cancelado</span>}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-8 space-y-5">
        {msg && (
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in ${msg.type === "success" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-danger/10 border border-danger/20 text-danger"}`}
            role={msg.type === "error" ? "alert" : "status"} aria-live="polite">
            {msg.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
            {msg.text}
          </div>
        )}

        {/* Progress Bar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-3">Arrecadado</span>
            <span className="text-sm font-semibold text-text">R$ {formatBRL(booking.paidValue)} / R$ {formatBRL(booking.totalValue)}</span>
          </div>
          <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${progresso}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-3">{progresso}% &bull; R$ {formatBRL(rem)} restantes</p>
          {booking.platformFee > 0 && (
            <p className="mt-1 text-xs text-text-3">Taxa MatchDay (5%): R$ {formatBRL(booking.platformFee)}</p>
          )}
        </div>

        {/* Join / CTA Section */}
        {booking.status === "PENDING" && !isJoined && session && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">Participar</h3>
            <p className="text-sm text-text-3 mb-4">Entre na reserva para poder pagar sua parte.</p>
            <button onClick={handleJoin} disabled={joining} className="btn-primary w-full">
              {joining ? "Entrando..." : "Quero Jogar!"}
            </button>
          </div>
        )}

        {/* PIX Payment */}
        {booking.status === "PENDING" && isJoined && rem > 0 && (
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide">Fazer Pagamento</h3>

            {creditBalance > 0 && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span className="text-text-2">Creditos disponiveis</span>
                </div>
                <span className="font-semibold text-primary">R$ {formatBRL(creditBalance)}</span>
              </div>
            )}

            {creditBalance > 0 && rem > 0 && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={useCredits} onChange={(e) => setUseCredits(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-surface-2 text-primary focus:ring-primary" />
                <span className="text-sm text-text-2">Usar creditos para pagar</span>
              </label>
            )}

            {!useCredits && (
              <div>
                <label className="text-xs text-text-3 mb-1 block" htmlFor="pay-value">Valor (R$ 0,01 a R$ {formatBRL(rem)})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 text-sm">R$</span>
                  <input
                    id="pay-value"
                    type="text"
                    inputMode="decimal"
                    value={payValue}
                    onChange={handlePayValueChange}
                    className="input-base"
                    style={{ paddingLeft: "36px" }}
                    placeholder="0,00"
                  />
                </div>
              </div>
            )}
            <button onClick={handlePay} disabled={paying || (!useCredits && !payValue)} className="btn-primary w-full">
              {paying ? "Processando..." : useCredits ? "Pagar com Creditos" : payValue ? `Pagar R$ ${formatBRL(parseFloat(payValue))}` : "Defina o valor"}
            </button>

            {showPix && currentPix && (
              <div className="text-center space-y-3 pt-2 animate-fade-in-up">
                <div className="mx-auto w-48 h-48 rounded-xl bg-white p-3 flex items-center justify-center">
                  {currentPix.qrCodeBase64 ? (
                    <Image src={`data:image/png;base64,${currentPix.qrCodeBase64}`} alt="QR Code PIX" width={192} height={192} className="w-full h-full" />
                  ) : (
                    <p className="text-xs text-black break-all font-mono p-2">{currentPix.qrCode}</p>
                  )}
                </div>
                <button onClick={() => { navigator.clipboard.writeText(currentPix.qrCode); setMsg({ text: "Codigo PIX copiado!", type: "success" }); }}
                  type="button" className="text-xs text-primary hover:underline font-medium">
                  Copiar codigo PIX
                </button>
                <p className="text-xs text-text-3">O QR Code expira em 48 horas.</p>
              </div>
            )}

            {showPix && lastContributionId && (
              <button onClick={async () => {
                setMsg(null); setPaying(true);
                const res = await fetch("/api/pix/verificar", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contributionId: lastContributionId }),
                });
                const data = await res.json();
                setMsg({ text: data.message, type: data.paid ? "success" : "error" });
                if (data.paid) { setShowPix(false); setPayValue(""); load(); }
                setPaying(false);
              }} disabled={paying} className="btn-secondary w-full text-sm">
                {paying ? "Verificando..." : "Ja paguei - Verificar"}
              </button>
            )}
          </div>
        )}

        {/* Participants List */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">
            Jogadores ({booking.participants.length})
          </h3>
          {booking.participants.length === 0 ? (
            <p className="text-sm text-text-3">Nenhum jogador confirmado ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {booking.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-border text-xs font-semibold text-text-2">
                      {p.user.name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm text-text">{p.user.name}</span>
                  </div>
                  {p.hasPaid && (
                    <span className="badge badge-green text-[10px] px-2 py-0.5">Pago</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contributions List */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">
            Contribuicoes ({booking.contributions.length})
          </h3>
          {booking.contributions.length === 0 ? (
            <p className="text-sm text-text-3">Ninguem contribuiu ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-2.5">
              {booking.contributions.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-border text-xs font-semibold text-text-2">
                      {c.user.name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm text-text">{c.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-3">R$ {formatBRL(c.amount)}</span>
                    {c.paid ? (
                      <span className="badge badge-green text-[10px] px-2 py-0.5">Pago</span>
                    ) : (
                      <span className="badge badge-yellow text-[10px] px-2 py-0.5">Pendente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Link */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-2 uppercase tracking-wide">Compartilhar</h3>
            <div className="flex gap-2">
              <button onClick={() => {
                const msgText = encodeURIComponent(`⚽ Bora jogar! Reservei no MatchDay: ${booking.shareLink}`);
                window.open(`https://wa.me/?text=${msgText}`, "_blank");
              }} type="button" className="text-xs font-medium text-primary hover:underline">WhatsApp</button>
              <button onClick={copyLink} type="button" className="text-xs text-primary hover:underline">Copiar link</button>
            </div>
          </div>
          <p className="mt-1 text-xs text-text-3 truncate select-all">{booking.shareLink}</p>
        </div>

        {/* Payment Deadline */}
        {booking.status === "PENDING" && (
          <div className="text-center">
            <p className="text-xs text-text-3">
              Prazo para pagamento: {new Date(booking.paymentDeadline).toLocaleString("pt-BR")}
            </p>
          </div>
        )}

        {/* Back & Cancel */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => window.history.back()} className="btn-secondary flex-1">
            Voltar
          </button>
          {booking.status === "PENDING" && (
            <button onClick={() => setShowCancelConfirm(true)} className="btn-secondary flex-1 text-danger border-danger/20 hover:bg-danger/5">
              Cancelar Reserva
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface border border-border p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <h3 id="cancel-title" className="text-lg font-bold text-text">Cancelar Reserva</h3>
                <p className="text-sm text-text-3">Tem certeza? Esta acao nao pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowCancelConfirm(false)} className="btn-secondary flex-1" disabled={cancelling}>
                Nao, manter
              </button>
              <button onClick={handleCancel} disabled={cancelling} className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/80 disabled:opacity-50">
                {cancelling ? "Cancelando..." : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
