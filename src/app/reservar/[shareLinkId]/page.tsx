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
  participants: { id: string; hasPaid: boolean; user: { id: string; name: string } }[];
  contributions: Contribution[];
}

export default function ReservarPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<BookingData | null>(null);
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

  useEffect(() => { const run = async () => { await load(); }; run(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const id = (await params).shareLinkId;
    const res = await fetch(`/api/reservar/${id}`);
    if (res.ok) setBooking(await res.json());

    const cr = await fetch("/api/credits");
    if (cr.ok) { const d = await cr.json(); setCreditBalance(d.total); }

    setLoading(false);
  }

  async function handlePay() {
    if (!session) { signIn(); return; }
    if (!booking || !payValue) return;
    const amount = parseFloat(payValue);
    if (amount < 0.01 || amount > remaining()) return;

    setPaying(true); setMsg(null);
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
      setMsg({ text: "Pagamento confirmado com créditos!", type: "success" });
      setCreditBalance((prev) => prev - amount);
      load();
    } else {
      setMsg({ text: data.error || "Erro ao gerar PIX.", type: "error" });
    }
    setPaying(false);
  }

  function remaining() { return booking ? Number(booking.totalValue) - Number(booking.paidValue) : 0; }

  function copyLink() {
    if (booking?.shareLink) navigator.clipboard.writeText(booking.shareLink);
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
      <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
    </div>
  );

  if (!booking) return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
      <p className="text-text-3">Reserva não encontrada.</p>
    </div>
  );

  const progresso = booking.totalValue > 0 ? Math.round((booking.paidValue / booking.totalValue) * 100) : 0;
  const dia = new Date(booking.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-5 pt-12 pb-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 border border-primary/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{booking.field.name}</h1>
              <p className="text-sm text-text-3">{dia} • {String(booking.startHour).padStart(2, "0")}h</p>
            </div>
          </div>
          {booking.status === "CONFIRMED" && <div className="badge badge-green">Confirmado</div>}
          {booking.status === "PENDING" && <div className="badge badge-yellow">Aguardando pagamentos</div>}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-8 space-y-5">
        {msg && (
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in ${msg.type === "success" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-danger/10 border border-danger/20 text-danger"}`}>
            {msg.text}
          </div>
        )}

        {/* Progress Bar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-3">Arrecadado</span>
            <span className="text-sm font-semibold text-text">R$ {booking.paidValue.toFixed(2)} / R$ {booking.totalValue.toFixed(2)}</span>
          </div>
          <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progresso}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-3">{progresso}% • {remaining().toFixed(2)} restantes</p>
          {booking.platformFee > 0 && (
            <p className="mt-1 text-xs text-text-3">Taxa MatchDay: R$ {booking.platformFee.toFixed(2)}</p>
          )}
        </div>

        {/* PIX Payment */}
        {remaining() > 0 && (
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide">Fazer Pagamento</h3>

            {/* Créditos disponíveis */}
            {creditBalance > 0 && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span className="text-text-2">Créditos disponíveis</span>
                </div>
                <span className="font-semibold text-primary">R$ {creditBalance.toFixed(2)}</span>
              </div>
            )}

            {creditBalance > 0 && remaining() > 0 && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={useCredits} onChange={(e) => setUseCredits(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-surface-2 text-primary focus:ring-primary" />
                <span className="text-sm text-text-2">Usar créditos para pagar</span>
              </label>
            )}

            {session ? (
              <>
                <div>
                  <label className="text-xs text-text-3 mb-1 block">Valor (R$ 0,01 a R$ {remaining().toFixed(2)})</label>
                  <input type="number" step="0.01" min="0.01" max={remaining()} value={payValue} onChange={(e) => setPayValue(e.target.value)}
                    className="input-base" placeholder="Quanto deseja pagar?" />
                </div>
                <button onClick={handlePay} disabled={paying || !payValue} className="btn-primary w-full">
                  {paying ? "Processando..." : useCredits ? "Pagar com Créditos" : `Pagar R$ ${parseFloat(payValue || "0").toFixed(2)}`}
                </button>
              </>
            ) : (
              <button onClick={() => signIn()} className="btn-primary w-full">
                Fazer login para pagar
              </button>
            )}

            {showPix && currentPix && (
              <div className="text-center space-y-3 pt-2 animate-fade-in-up">
                <div className="mx-auto w-48 h-48 rounded-xl bg-white p-3 flex items-center justify-center">
                  {currentPix.qrCodeBase64 ? (
                    <Image src={`data:image/png;base64,${currentPix.qrCodeBase64}`} alt="QR Code PIX" width={192} height={192} className="w-full h-full" />
                  ) : (
                    <p className="text-xs text-black break-all font-mono">{currentPix.qrCode}</p>
                  )}
                </div>
                <button onClick={() => navigator.clipboard.writeText(currentPix.qrCode)}
                  className="text-xs text-primary hover:underline font-medium">
                  Copiar código PIX
                </button>
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
                if (data.paid) { setShowPix(false); load(); }
                setPaying(false);
              }} disabled={paying} className="btn-secondary w-full text-sm">
                {paying ? "Verificando..." : "Já paguei - Verificar"}
              </button>
            )}
          </div>
        )}

        {/* Share Link */}
            <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-2 uppercase tracking-wide">Compartilhar</h3>
            <div className="flex gap-2">
              <button onClick={() => {
                const msg = encodeURIComponent(`⚽ Bora jogar! Reservei no MatchDay: ${booking.shareLink}`);
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }} className="text-xs font-medium text-primary hover:underline">WhatsApp</button>
              <button onClick={copyLink} className="text-xs text-primary hover:underline">Copiar link</button>
            </div>
          </div>
          <p className="mt-1 text-xs text-text-3 truncate">{booking.shareLink}</p>
        </div>

        {/* Contributors List */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wide mb-3">
            Contribuições ({booking.contributions.length})
          </h3>
          {booking.contributions.length === 0 ? (
            <p className="text-sm text-text-3">Ninguém contribuiu ainda. Seja o primeiro!</p>
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
                    <span className="text-xs text-text-3">R$ {c.amount.toFixed(2)}</span>
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

        {/* Payment Deadline */}
        {booking.status === "PENDING" && (
          <div className="text-center">
            <p className="text-xs text-text-3">
              Prazo final: {new Date(booking.paymentDeadline).toLocaleString("pt-BR")}
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
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface border border-border p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Cancelar Reserva</h3>
                <p className="text-sm text-text-3">Tem certeza? Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowCancelConfirm(false)} className="btn-secondary flex-1" disabled={cancelling}>
                Não, manter
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
