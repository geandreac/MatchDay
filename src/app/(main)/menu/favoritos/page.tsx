"use client";

import { useState } from "react";
import Link from "next/link";
import { useAsync } from "@/lib/use-async";
import { ErrorMessage } from "@/components/error-message";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface FavoriteField {
  id: string;
  field: { id: string; name: string; city: string; address: string; pricePerHour: number; startHour: number; endHour: number };
}

export default function Favoritos() {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: favorites, loading, error, retry } = useAsync<FavoriteField[]>(
    async (signal) => {
      const res = await fetch("/api/favorites", { signal });
      if (!res.ok) throw new Error("Erro ao carregar favoritos");
      return res.json();
    },
  );

  const list = Array.isArray(favorites) ? favorites : [];

  async function handleRemoveConfirm(fieldId: string) {
    setRemovingId(fieldId);
  }

  async function handleRemoveExecute() {
    if (!removingId) return;
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId: removingId }),
      });
    } catch {}
    setRemovingId(null);
    retry();
  }

  return (
    <div className="space-y-5">
      <ConfirmDialog
        open={!!removingId}
        title="Remover Favorito"
        message="Tem certeza que deseja remover este campo dos favoritos?"
        confirmLabel="Remover"
        danger
        onConfirm={handleRemoveExecute}
        onCancel={() => setRemovingId(null)}
      />

      <h2 className="text-lg font-bold text-text">Campos Favoritos</h2>

      {loading ? (
        <div className="flex justify-center py-12"><div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div></div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 border border-secondary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <p className="text-sm text-text-3">Nenhum campo favoritado.</p>
          <Link href="/search" className="btn-primary text-sm">Buscar Campos</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((fav) => (
            <div key={fav.id} className="card p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text truncate">{fav.field.name}</p>
                <p className="text-xs text-text-3">{fav.field.city}</p>
              </div>
              <button onClick={() => handleRemoveConfirm(fav.field.id)} className="text-xs text-danger hover:underline shrink-0">Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
