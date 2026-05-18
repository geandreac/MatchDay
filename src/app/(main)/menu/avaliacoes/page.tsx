"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Pendente {
  id: string; fieldId: string;
  field: { name: string };
  date: string;
}

export default function Avaliacoes() {
  const [pending, setPending] = useState<Pendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<Record<string, number>>({});
  const [comment, setComment] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ratings/pendentes").then((r) => r.json()).then((d) => { setPending(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function submitRating(bookingId: string, fieldId: string) {
    if (!rating[bookingId]) return;
    setSubmitting(bookingId);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, fieldId, score: rating[bookingId], comment: comment[bookingId] || null }),
    });
    setPending((prev) => prev.filter((p) => p.id !== bookingId));
    setSubmitting(null);
  }

  return (
    <div className="space-y-5">
      <Link href="/menu" className="flex items-center gap-2 text-sm text-text-3 hover:text-text transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </Link>

      <h2 className="text-lg font-bold text-text">Avaliações Pendentes</h2>

      {loading ? (
        <div className="flex justify-center py-12"><div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div></div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <p className="text-sm text-text-3">Nenhuma avaliação pendente.</p>
          <p className="text-xs text-text-3/60">Após uma partida concluída, você poderá avaliar o campo aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="card p-5 space-y-4">
              <div>
                <p className="font-semibold text-text">{p.field.name}</p>
                <p className="text-xs text-text-3">{new Date(p.date).toLocaleDateString("pt-BR")}</p>
              </div>

              {/* Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating((prev) => ({ ...prev, [p.id]: star }))}
                    className="transition-all duration-200 hover:scale-110">
                    <svg width="28" height="28" viewBox="0 0 24 24"
                      fill={star <= (rating[p.id] || 0) ? "#f59e0b" : "none"}
                      stroke={star <= (rating[p.id] || 0) ? "#f59e0b" : "#64748b"}
                      strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>

              <textarea value={comment[p.id] || ""} onChange={(e) => setComment((prev) => ({ ...prev, [p.id]: e.target.value }))}
                className="input-base" rows={2} placeholder="Comentário (opcional)..." />

              <button onClick={() => submitRating(p.id, p.fieldId)} disabled={submitting === p.id || !rating[p.id]}
                className="btn-primary w-full text-sm">
                {submitting === p.id ? "Enviando..." : "Enviar Avaliação"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
