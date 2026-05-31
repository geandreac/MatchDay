"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ErrorMessage } from "@/components/error-message";

interface FieldResult {
  id: string; name: string; city: string; address: string;
  pricePerHour: number; startHour: number; endHour: number;
  capacity: number; distanciaKm?: number;
  owner: { name: string };
}

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [fields, setFields] = useState<FieldResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [posError, setPosError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFields = useCallback(async (query: string, filter: string | null, pos: { lat: number; lng: number } | null, pageNum = 1) => {
    const isLoadMore = pageNum > 1;
    if (isLoadMore) setLoadingMore(true); else setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filter === "city" && query) params.set("city", query);
      if (filter === "nearby" && pos) {
        params.set("lat", String(pos.lat));
        params.set("lng", String(pos.lng));
      }
      params.set("page", String(pageNum));

      const res = await fetch(`/api/fields/search?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar campos");
      const data = await res.json();
      const newFields = Array.isArray(data.fields) ? data.fields : [];
      const pag = data.pagination ?? {};
      if (isLoadMore) {
        setFields((prev) => [...prev, ...newFields]);
      } else {
        setFields(newFields);
      }
      setPage(pageNum);
      setHasMore((pag.page ?? 1) < (pag.totalPages ?? 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar campos");
      if (!isLoadMore) setFields([]);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  const retry = useCallback(() => {
    fetchFields(search, activeFilter, null);
  }, [search, activeFilter, fetchFields]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (activeFilter === "nearby") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          fetchFields(search, activeFilter, p);
        },
        () => {
          setPosError(true);
          fetchFields(search, activeFilter, null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      debounceRef.current = setTimeout(() => fetchFields(search, activeFilter, null), 300);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeFilter, fetchFields]);

  const filters = [
    { id: "name", label: "Nome" },
    { id: "city", label: "Cidade" },
    { id: "nearby", label: "Proximo" },
  ];

  return (
    <div className="space-y-5">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar campo..."
          className="input-base"
          style={{ paddingLeft: "44px" }}
          aria-label="Buscar campos de futebol"
        />
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activeFilter === f.id ? "bg-primary text-white" : "bg-surface-2 text-text-2 hover:bg-surface-2/70"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {posError && (
        <p className="text-sm text-danger">Nao foi possivel obter sua localizacao.</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : !search && !activeFilter ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <p className="text-sm text-text-3">Busque por nome, cidade ou use o filtro Proximo.</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-sm text-text-3">Nenhum campo encontrado.</p>
          <p className="text-xs text-text-3/60">Tente buscar por outro termo ou cidade.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((f) => (
            <Link key={f.id} href={`/campo/${f.id}`} className="card block p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text">{f.name}</p>
                  <p className="text-xs text-text-3 mt-0.5">
                    {f.city} &bull; R$ {f.pricePerHour}/h
                    {f.distanciaKm != null && ` &bull; ${f.distanciaKm} km`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-secondary" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
              </div>
            </Link>
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchFields(search, activeFilter, null, page + 1)}
                disabled={loadingMore}
                className="btn-secondary text-sm"
              >
                {loadingMore ? "Carregando..." : "Carregar mais campos"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
