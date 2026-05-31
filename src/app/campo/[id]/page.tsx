"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface CampoData {
  id: string; name: string; address: string; city: string; state: string | null;
  description: string | null; capacity: number; pricePerHour: number;
  startHour: number; endHour: number; photos: string[];
  avgRating: number | null; totalRatings: number;
  availableDays: number[]; latitude?: number; longitude?: number;
  activeBookings: { date: string; startHour: number; endHour: number }[];
  owner: { name: string };
}

function fmtDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fmtDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function generateDates(availableDays: number[], weeks = 4) {
  const dates: Date[] = [];
  const today = new Date();
  for (let d = 0; d < weeks * 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (availableDays.includes(date.getDay())) {
      dates.push(date);
    }
  }
  return dates;
}

interface ActiveBooking {
  date: string; startHour: number; endHour: number;
}

function generateTimeSlots(startH: number, endH: number, activeBookings: ActiveBooking[], dateStr: string) {
  const slots: { hour: number; available: boolean }[] = [];
  const dayBookings = activeBookings.filter((b) => {
    const bDate = new Date(b.date);
    const bFmt = fmtDate(bDate);
    return bFmt === dateStr;
  });

  let h = startH;
  const end = endH <= startH ? endH + 24 : endH;
  while (h < end) {
    const hour = h % 24;
    const isBooked = dayBookings.some(
      (b) => hour >= b.startHour && hour < b.endHour
    );
    slots.push({ hour, available: !isBooked });
    h++;
  }
  return slots;
}

export default function CampoDetalhes() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [campo, setCampo] = useState<CampoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      const id = (await params).id;
      const res = await fetch(`/api/campo/${id}`);
      if (res.ok) setCampo(await res.json());
      setLoading(false);
    })();
  }, [params]);

  function toggleSlot(hour: number) {
    setSelectedSlots((prev) => {
      if (prev.includes(hour)) return prev.filter((h) => h !== hour);
      const sorted = [...prev, hour].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] - sorted[i - 1] > 1) return [hour];
      }
      return sorted;
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
      </div>
    );
  }

  if (!campo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-text-3">Campo não encontrado.</p>
        <Link href="/search" className="btn-primary">Voltar</Link>
      </div>
    );
  }

  const dates = generateDates(campo.availableDays);
  const slots = selectedDate ? generateTimeSlots(campo.startHour, campo.endHour, campo.activeBookings, selectedDate) : [];
  const totalHours = selectedSlots.length;
  const totalValue = totalHours * campo.pricePerHour;
  const platformFee = totalValue * 0.05;
  const grandTotal = totalValue + platformFee;

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero */}
      <div className="relative h-56 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {campo.photos.length > 0 ? (
            <Image src={campo.photos[0]} alt={campo.name} fill className="object-cover opacity-40" sizes="100vw" />
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1" className="opacity-30"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          )}
        </div>
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 backdrop-blur border border-white/10 text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">{campo.name}</h1>
          <p className="text-sm text-white/80">{campo.city}{campo.state ? `, ${campo.state}` : ""}</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 py-5 space-y-6">
        {/* Rating & Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="font-semibold text-text">{campo.avgRating ?? "-"}</span>
            </div>
            <span className="text-xs text-text-3">({campo.totalRatings} avaliações)</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">R$ {campo.pricePerHour}</p>
            <p className="text-xs text-text-3">por hora</p>
          </div>
        </div>

        {/* Description */}
        {campo.description && (
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-text-2 tracking-wide uppercase mb-2">Descrição</h3>
            <p className="text-sm text-text-2">{campo.description}</p>
          </div>
        )}

        {/* Location */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-text-2 tracking-wide uppercase mb-2">Localizacao</h3>
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${campo.latitude && campo.longitude ? "bg-primary/10 border border-primary/20" : "bg-surface-2 border border-border"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className={campo.latitude && campo.longitude ? "text-primary" : "text-text-3"}
                aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text">{campo.address}</p>
              <p className="text-xs text-text-3 mt-0.5">{campo.city}{campo.state ? `, ${campo.state}` : ""}</p>
            </div>
          </div>
          {campo.latitude && campo.longitude ? (
            <div className="flex gap-2 mt-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${campo.latitude},${campo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir rota para ${campo.name} no Google Maps`}
                title="Abrir no Google Maps"
                className="flex-1 btn-secondary text-xs text-center flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Google Maps
              </a>
              <a
                href={`https://waze.com/ul?ll=${campo.latitude},${campo.longitude}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir rota para ${campo.name} no Waze`}
                title="Abrir no Waze"
                className="flex-1 btn-secondary text-xs text-center flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Waze
              </a>
            </div>
          ) : campo.address ? (
            <div className="flex gap-2 mt-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${campo.address}, ${campo.city}${campo.state ? `, ${campo.state}` : ""}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir rota para ${campo.name} no Google Maps (endereco)`}
                title="Abrir no Google Maps pelo endereco"
                className="flex-1 btn-secondary text-xs text-center flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Google Maps
              </a>
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-surface-2 border border-border px-3 py-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-3 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-xs text-text-3">Localizacao nao disponivel para gerar rota.</p>
            </div>
          )}
        </div>

        {/* Photos */}
        {campo.photos.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-text-2 tracking-wide uppercase mb-3">Fotos</h3>
            <div className="grid grid-cols-3 gap-2">
              {campo.photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl bg-surface-2 overflow-hidden border border-border">
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 33vw, 150px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Dates */}
        <div>
          <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">Datas Disponíveis</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((date) => {
              const ds = fmtDate(date);
              const active = selectedDate === ds;
              const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
              const dayNum = date.getDate();
              return (
                <button key={ds} onClick={() => { setSelectedDate(ds); setSelectedSlots([]); }}
                  className={`shrink-0 flex flex-col items-center gap-0.5 rounded-xl px-4 py-3 min-w-[64px] transition-all ${
                    active ? "bg-primary text-white glow-green-sm" : "card hover:border-primary/40"
                  }`}>
                  <span className="text-xs font-medium uppercase">{dayName}</span>
                  <span className="text-lg font-bold">{dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">
              Horários — {fmtDateBR(selectedDate)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {slots.map(({ hour, available }) => {
                const selected = selectedSlots.includes(hour);
                return (
                  <button key={hour} onClick={() => available && toggleSlot(hour)}
                    disabled={!available}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? "bg-primary text-white"
                        : available
                        ? "card hover:border-primary/40"
                        : "bg-surface-2 text-text-3/40 line-through cursor-not-allowed"
                    }`}>
                    {String(hour).padStart(2, "0")}:00
                  </button>
                );
              })}
            </div>
            {totalHours > 0 && (
              <div className="mt-4 card p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-3">{totalHours}h x R$ {campo.pricePerHour}</span>
                  <span className="font-semibold text-text">R$ {totalValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-text-3">Taxa MatchDay (5%)</span>
                  <span className="text-text">R$ {platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border mt-2 pt-2 flex items-center justify-between font-semibold">
                  <span className="text-text">Total</span>
                  <span className="text-primary">R$ {grandTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => {
                  if (!session) { router.push("/login"); return; }
                  setShowModal(true);
                }} className="btn-primary w-full mt-4">
                  Confirmar Agendamento
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface border border-border p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-text mb-4">Confirmar Agendamento</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-3">Campo</span><span className="text-text font-medium">{campo.name}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Data</span><span className="text-text font-medium">{selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR") : ""}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Horário</span><span className="text-text font-medium">{selectedSlots.length > 0 ? `${String(selectedSlots[0]).padStart(2, "0")}h - ${String(selectedSlots[selectedSlots.length - 1] + 1).padStart(2, "0")}h` : ""}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Valor</span><span className="text-text font-medium">R$ {totalValue.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Taxa MatchDay (5%)</span><span className="text-text font-medium">R$ {platformFee.toFixed(2)}</span></div>
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span className="text-text">Total</span>
                <span className="text-primary">R$ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={async () => {
                const res = await fetch("/api/reservar/criar", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fieldId: campo.id,
                    date: selectedDate,
                    startHour: selectedSlots[0],
                    endHour: selectedSlots[selectedSlots.length - 1] + 1,
                    hours: totalHours,
                    totalValue,
                    platformFee,
                    grandTotal,
                  }),
                });
                if (res.ok) {
                  const data = await res.json();
                  router.push(`/reservar/${data.shareLinkId}`);
                }
              }} className="btn-primary flex-1">Ir para Pagamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
