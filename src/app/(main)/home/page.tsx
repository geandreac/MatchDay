"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LastBookingItem {
  id: string;
  fieldId: string;
  shareLinkId: string;
  date: string;
  startHour: number;
  endHour: number;
  totalValue: number;
  status: string;
  field?: { id?: string; name?: string; city?: string };
}

interface FavoriteFieldItem {
  name: string;
  city: string;
}

interface TimeSlot {
  hour: number;
  available: boolean;
}

interface FieldDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  startHour: number;
  endHour: number;
  pricePerHour: number;
  activeBookings: { date: string; startHour: number; endHour: number }[];
  availableDays: number[];
}

export default function HomePage() {
  const router = useRouter();
  const [lastBooking, setLastBooking] = useState<LastBookingItem | null>(null);
  const [favoriteField, setFavoriteField] = useState<FavoriteFieldItem | null>(null);
  const [stats, setStats] = useState({ campos: 0, partidas: 0 });
  const [loading, setLoading] = useState(true);

  const [showReagendar, setShowReagendar] = useState(false);
  const [reagendarField, setReagendarField] = useState<FieldDetail | null>(null);
  const [reagendarSlots, setReagendarSlots] = useState<TimeSlot[]>([]);
  const [reagendarLoading, setReagendarLoading] = useState(false);
  const [reagendarError, setReagendarError] = useState<string | null>(null);
  const [reagendarMsg, setReagendarMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [reagendarBook, setReagendarBook] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()).then((d) => {
        if (Array.isArray(d) && d.length > 0) setLastBooking(d[0]);
      }),
      fetch("/api/favorites").then((r) => r.json()).then((d) => {
        if (Array.isArray(d) && d.length > 0) setFavoriteField(d[0]?.field);
      }),
      fetch("/api/fields/search").then((r) => r.json()).then((d) => {
        const data = Array.isArray(d.fields) ? d.fields : Array.isArray(d) ? d : [];
        setStats((p) => ({ ...p, campos: data.length }));
      }),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleOpenReagendar() {
    if (!lastBooking?.fieldId) return;
    setShowReagendar(true);
    setReagendarLoading(true);
    setReagendarError(null);
    setReagendarMsg(null);

    try {
      const fRes = await fetch(`/api/campo/${lastBooking.fieldId}`);
      if (!fRes.ok) throw new Error("Campo indisponivel no momento.");

      const field: FieldDetail = await fRes.json();
      setReagendarField(field);

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      setSelectedDate(dateStr);
      setReagendarSlots(getSlots(field, dateStr));
    } catch (err) {
      setReagendarError(err instanceof Error ? err.message : "Erro ao carregar campo.");
    }
    setReagendarLoading(false);
  }

  function getSlots(field: FieldDetail, dateStr: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayBookings = field.activeBookings.filter((b) => {
      const bDate = new Date(b.date);
      return `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}-${String(bDate.getDate()).padStart(2, "0")}` === dateStr;
    });

    let h = field.startHour;
    const end = field.endHour <= field.startHour ? field.endHour + 24 : field.endHour;
    while (h < end) {
      const hour = h % 24;
      const booked = dayBookings.some((b) => hour >= b.startHour && hour < b.endHour);
      slots.push({ hour, available: !booked });
      h++;
    }
    return slots;
  }

  function isConsecutiveBlockAvailable(startH: number, endH: number): boolean {
    for (let h = startH; h < endH; h++) {
      const slot = reagendarSlots.find((s) => s.hour === h);
      if (!slot?.available) return false;
    }
    return true;
  }

  function getNextAvailableSlots(): number[][] {
    const availableHours = reagendarSlots.filter((s) => s.available).map((s) => s.hour);
    const blocks: number[][] = [];
    let current: number[] = [];
    for (const h of availableHours) {
      if (current.length === 0 || h === current[current.length - 1] + 1) {
        current.push(h);
      } else {
        if (current.length >= (lastBooking?.endHour ?? 0) - (lastBooking?.startHour ?? 0)) {
          blocks.push(current);
        }
        current = [h];
      }
    }
    if (current.length >= (lastBooking?.endHour ?? 0) - (lastBooking?.startHour ?? 0)) {
      blocks.push(current);
    }
    return blocks.slice(0, 3);
  }

  async function handleReagendar(startH: number, endH: number) {
    if (!lastBooking || !reagendarField || !selectedDate) return;
    setReagendarBook(true);
    setReagendarMsg(null);

    try {
      const hours = endH - startH;
      const total = hours * reagendarField.pricePerHour;
      const fee = total * 0.05;

      const res = await fetch("/api/reservar/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldId: lastBooking.fieldId,
          date: selectedDate,
          startHour: startH,
          endHour: endH,
          hours,
          totalValue: total,
          platformFee: fee,
          grandTotal: total + fee,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReagendarMsg({ text: "Reserva criada! Redirecionando...", ok: true });
        setTimeout(() => { setShowReagendar(false); router.push(`/reservar/${data.shareLinkId}`); }, 1200);
      } else {
        const d = await res.json();
        setReagendarMsg({ text: d.error ?? "Erro ao criar reserva.", ok: false });
      }
    } catch {
      setReagendarMsg({ text: "Erro de conexao.", ok: false });
    }
    setReagendarBook(false);
  }

  const prevStart = lastBooking?.startHour;
  const prevEnd = lastBooking?.endHour;
  const sameSlotAvailable = prevStart != null && prevEnd != null && isConsecutiveBlockAvailable(prevStart, prevEnd);
  const alternativeBlocks = !sameSlotAvailable ? getNextAvailableSlots() : [];
  const fieldInactive = reagendarError?.includes("Campo indisponivel");

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

      {/* Last Booking — clickable */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-2 tracking-wide uppercase">Ultimo Agendamento</h2>
          <Link href="/bookings" className="text-xs font-medium text-primary hover:underline">Ver todos</Link>
        </div>
        {lastBooking ? (
          <button
            onClick={handleOpenReagendar}
            className="card w-full p-5 text-left hover:border-primary/30 transition-colors group cursor-pointer"
            aria-label={`Reagendar ${lastBooking.field?.name ?? "campo"}. Clique para agendar novamente.`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text">{lastBooking.field?.name ?? "Reserva"}</p>
                <p className="text-xs text-text-3 mt-0.5">
                  {new Date(lastBooking.date).toLocaleDateString("pt-BR")} &bull; {String(lastBooking.startHour).padStart(2, "0")}h - {String(lastBooking.endHour).padStart(2, "0")}h
                </p>
                <p className="text-xs text-primary mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Agendar novamente &rarr;</p>
              </div>
              <span className="ml-auto">
                {lastBooking.status === "PENDING" && <span className="badge badge-yellow">Pendente</span>}
                {lastBooking.status === "CONFIRMED" && <span className="badge badge-green">Confirmado</span>}
                {lastBooking.status === "COMPLETED" && <span className="badge badge-blue">Concluido</span>}
              </span>
            </div>
          </button>
        ) : (
          <div className="card p-5">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              </div>
              <p className="text-sm text-text-3">Nenhum agendamento recente.</p>
              <Link href="/search" className="btn-primary text-sm">Encontrar campo</Link>
            </div>
          </div>
        )}
      </section>

      {/* Rebooking Modal */}
      {showReagendar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reagendar-title">
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface border border-border p-6 animate-fade-in-up max-h-[90dvh] overflow-y-auto space-y-5">
            <button onClick={() => setShowReagendar(false)} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 hover:bg-surface-2/70 transition-colors text-text-3" aria-label="Fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <h3 id="reagendar-title" className="text-lg font-bold text-text">Agendar Novamente</h3>

            {reagendarMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in ${reagendarMsg.ok ? "bg-primary/10 border border-primary/20 text-primary" : "bg-danger/10 border border-danger/20 text-danger"}`}
                role={reagendarMsg.ok ? "status" : "alert"} aria-live="polite">
                {reagendarMsg.ok ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                {reagendarMsg.text}
              </div>
            )}

            {reagendarLoading ? (
              <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
            ) : reagendarError && fieldInactive ? (
              <div className="space-y-4">
                <p className="text-sm text-text-2">O campo <strong>{lastBooking?.field?.name ?? "anterior"}</strong> nao esta disponivel no momento.</p>
                <Link href="/search" className="btn-primary w-full text-center block" onClick={() => setShowReagendar(false)}>
                  Buscar campos similares
                </Link>
              </div>
            ) : reagendarError ? (
              <div className="space-y-4">
                <p className="text-sm text-text-2">{reagendarError}</p>
                <button onClick={() => setShowReagendar(false)} className="btn-secondary w-full text-sm">Fechar</button>
              </div>
            ) : reagendarField ? (
              <>
                <div className="card p-4 text-sm">
                  <p className="font-semibold text-text">{reagendarField.name}</p>
                  <p className="text-xs text-text-3 mt-0.5">{reagendarField.city} &bull; R$ {reagendarField.pricePerHour}/h</p>
                </div>

                <p className="text-xs text-text-3">Continue de onde parou</p>

                {sameSlotAvailable && prevStart != null && prevEnd != null ? (
                  <div className="glass rounded-xl p-4 border border-primary/20 animate-fade-in-up space-y-3">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-sm font-medium text-primary">Mesmo horario disponivel hoje!</span>
                    </div>
                    <p className="text-xs text-text-3">
                      {String(prevStart).padStart(2, "0")}h - {String(prevEnd).padStart(2, "0")}h &bull; R$ {((prevEnd - prevStart) * reagendarField.pricePerHour).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleReagendar(prevStart, prevEnd)}
                      disabled={reagendarBook}
                      className="btn-primary w-full"
                    >
                      {reagendarBook ? "Reservando..." : `Agendar ${String(prevStart).padStart(2, "0")}h - ${String(prevEnd).padStart(2, "0")}h`}
                    </button>
                  </div>
                ) : alternativeBlocks.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-text-3">Horario anterior indisponivel. Próximos horarios:</p>
                    {alternativeBlocks.map((block, i) => (
                      <div key={i} className="card p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-text">{String(block[0]).padStart(2, "0")}h - {String(block[block.length - 1] + 1).padStart(2, "0")}h</p>
                          <p className="text-xs text-text-3">R$ {(block.length * reagendarField.pricePerHour).toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleReagendar(block[0], block[block.length - 1] + 1)}
                          disabled={reagendarBook}
                          className="btn-primary text-xs py-2 px-4"
                        >
                          Agendar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-text-2">Nenhum horario disponivel hoje para este campo.</p>
                    <Link href={`/campo/${lastBooking?.fieldId}`} className="btn-primary w-full text-center block" onClick={() => setShowReagendar(false)}>
                      Ver todos os horarios
                    </Link>
                  </div>
                )}
              </>
            ) : null}

            <button onClick={() => setShowReagendar(false)} className="btn-secondary w-full text-sm">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MapIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>); }
function BallIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>); }
function HeartSmIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>); }
