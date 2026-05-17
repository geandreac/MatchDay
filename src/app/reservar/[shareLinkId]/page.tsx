"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

interface BookingData {
  id: string;
  field: { name: string; address: string; city: string; pricePerHour: number };
  user: { name: string };
  date: string;
  startHour: number;
  endHour: number;
  totalValue: number;
  paidValue: number;
  shareValue: number;
  totalPlayers: number;
  status: string;
  paymentDeadline: string;
  participants: { id: string; hasPaid: boolean; user: { id: string; name: string; image: string | null } }[];
}

export default function ReservarPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showPix, setShowPix] = useState(false);

  useEffect(() => {
    (async () => {
      const id = (await params).shareLinkId;
      const res = await fetch(`/api/reservar/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
        checkIfAlreadyPaid(data);
      }
      setLoading(false);
    })();
  }, [params]);

  function checkIfAlreadyPaid(data: BookingData) {
    if (!session?.user?.id) return;
    const myParticipation = data.participants.find((p: any) => p.user?.id === session.user!.id);
    if (myParticipation?.hasPaid) setShowPix(true);
  }

  async function handleJoin() {
    if (!session) { signIn(); return; }
    setJoining(true); setMessage(null);
    const id = (await params).shareLinkId;
    const res = await fetch(`/api/reservar/${id}/participar`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage({ text: "Você entrou na reserva!", type: "success" });
      const res2 = await fetch(`/api/reservar/${id}`);
      if (res2.ok) setBooking(await res2.json());
    } else {
      setMessage({ text: data.error, type: "error" });
    }
    setJoining(false);
  }

  async function handlePay() {
    setPaying(true); setMessage(null);
    const id = (await params).shareLinkId;
    const res = await fetch(`/api/reservar/${id}/pagar`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage({ text: "Pagamento confirmado! PIX simulado com sucesso.", type: "success" });
      const res2 = await fetch(`/api/reservar/${id}`);
      if (res2.ok) setBooking(await res2.json());
      setShowPix(true);
    } else {
      setMessage({ text: data.error, type: "error" });
    }
    setPaying(false);
  }

  const isParticipant = booking?.participants?.some((p: any) => p.user?.id === session?.user?.id);
  const hasPaid = booking?.participants?.some((p: any) => p.user?.id === session?.user?.id && p.hasPaid);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center"><div className="h-4 w-4 rounded-full bg-primary" /></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-border">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <p className="text-text-3">Reserva não encontrada ou link inválido.</p>
      </div>
    );
  }

  const dia = new Date(booking.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const hora = `${String(booking.startHour).padStart(2, "0")}h às ${String(booking.endHour).padStart(2, "0")}h`;
  const progresso = booking.totalValue > 0 ? Math.round((booking.paidValue / booking.totalValue) * 100) : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-5 pt-12 pb-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px]" />
        <div className="relative mx-auto max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 glow-green-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">{booking.field.name}</h1>
              <p className="text-sm text-text-3">{booking.field.city}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-text-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              {dia}
            </div>
            <div className="flex items-center gap-1.5 text-text-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {hora}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 px-5 pb-8 space-y-5">
        {/* Status Banner */}
        {booking.status === "CONFIRMED" && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center gap-2 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Reserva confirmada! Pagamento mínimo atingido.
          </div>
        )}
        {booking.status === "REFUNDED" && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger flex items-center gap-2 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Reserva cancelada • Pagamentos reembolsados (mínimo 50% não atingido).
          </div>
        )}
        {booking.status === "PENDING" && booking.paymentDeadline && new Date(booking.paymentDeadline) > new Date() && (
          <div className="rounded-xl bg-secondary/10 border border-secondary/20 px-4 py-3 text-sm text-secondary flex items-center gap-2 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Prazo para pagamento mínimo de 50%: {new Date(booking.paymentDeadline).toLocaleDateString("pt-BR")}
          </div>
        )}

        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm animate-fade-in flex items-center gap-2 ${
            message.type === "success"
              ? "bg-primary/10 border border-primary/20 text-primary"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}>
            {message.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
            {message.text}
          </div>
        )}

        {/* Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-3">Arrecadado</p>
            <p className="text-sm font-semibold text-text">
              R$ {booking.paidValue.toFixed(2)} <span className="text-text-3 font-normal">/ R$ {booking.totalValue.toFixed(2)}</span>
            </p>
          </div>
          <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${progresso}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-3">{progresso}% • {booking.totalPlayers} participante{booking.totalPlayers !== 1 ? "s" : ""}</p>
        </div>

        {/* Participants */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">
            Participantes ({booking.totalPlayers})
          </h3>
          {booking.participants.length === 0 ? (
            <p className="text-sm text-text-3">Ninguém entrou ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-2.5">
              {booking.participants.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-border text-xs font-semibold text-text-2">
                      {p.user.name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm text-text">{p.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-3">R$ {Number(p.shareValue || booking.shareValue).toFixed(2)}</span>
                    {p.hasPaid ? (
                      <span className="badge badge-green text-[10px] px-2 py-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Pago
                      </span>
                    ) : (
                      <span className="badge badge-yellow text-[10px] px-2 py-0.5">Pendente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isParticipant && (
            <button onClick={handleJoin} disabled={joining} className="btn-primary w-full">
              {joining ? "Entrando..." : "Entrar na Reserva"}
            </button>
          )}

          {isParticipant && !hasPaid && (
            <>
              <button onClick={handlePay} disabled={paying} className="btn-primary w-full">
                {paying ? "Processando..." : `Pagar R$ ${booking.shareValue.toFixed(2)} via PIX`}
              </button>
              <p className="text-xs text-center text-text-3">Pagamento simulado • PIX será integrado em breve</p>
            </>
          )}

          {hasPaid && showPix && (
            <div className="card p-5 text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm font-semibold text-text">Pagamento Confirmado!</p>
              <p className="text-xs text-text-3">Sua parte de R$ {booking.shareValue.toFixed(2)} foi paga.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
