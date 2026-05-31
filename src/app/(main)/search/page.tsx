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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("nearby");
  const [posError, setPosError] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geoLoadedRef = useRef(false);

  const fetchFields = useCallback(async (
    query: string,
    filter: string | null,
    pos: { lat: number; lng: number } | null,
    pageNum = 1,
  ) => {
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

  useEffect(() => {
    if (geoLoadedRef.current) return;
    geoLoadedRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setPosError(false);
        setActiveFilter("nearby");
        setGeoLoading(false);
        fetchFields("", "nearby", p);
      },
      () => {
        setPosError(true);
        setUserPos(null);
        setActiveFilter("name");
        setGeoLoading(false);
        fetchFields("", null, null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryGeo = useCallback(() => {
    setPosError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setPosError(false);
        setActiveFilter("nearby");
        setGeoLoading(false);
        fetchFields("", "nearby", p);
      },
      () => {
        setPosError(true);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [fetchFields]);

  useEffect(() => {
    if (geoLoading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (activeFilter === "nearby") {
      if (userPos) {
        debounceRef.current = setTimeout(() => fetchFields(search, "nearby", userPos), 300);
      }
    } else {
      debounceRef.current = setTimeout(() => fetchFields(search, activeFilter, null), 300);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeFilter, userPos, geoLoading, fetchFields]);

  function handleFilterToggle(filterId: string) {
    if (filterId === "nearby" && !userPos) {
      retryGeo();
      return;
    }
    setActiveFilter((prev) => (prev === filterId ? "name" : filterId));
  }

  const filters = [
    { id: "nearby", label: "Mais proximos" },
    { id: "name", label: "Nome" },
    { id: "city", label: "Cidade" },
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
            onClick={() => handleFilterToggle(f.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activeFilter === f.id ? "bg-primary text-white" : "bg-surface-2 text-text-2 hover:bg-surface-2/70"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {posError && (
        <div className="glass rounded-xl px-4 py-3 text-sm border border-secondary/20 animate-fade-in">
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary shrink-0 mt-0.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p className="text-text-2">Localizacao nao disponivel.</p>
              <p className="text-xs text-text-3 mt-0.5">Permita o acesso a localizacao para ver campos proximos, ou use os filtros Nome/Cidade.</p>
              <button onClick={retryGeo} disabled={geoLoading} className="mt-2 text-xs font-medium text-primary hover:underline">
                {geoLoading ? "Tentando..." : "Tentar novamente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && geoLoading ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
          <p className="text-sm text-text-3">Obtendo localizacao...</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="relative"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchFields(search, activeFilter, userPos)} />
      ) : fields.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          {activeFilter === "nearby" && userPos ? (
            <>
              <p className="text-sm text-text-3">Nenhum campo encontrado em ate 5 km.</p>
              <p className="text-xs text-text-3/60">Tente ampliar a busca por nome ou cidade.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-text-3">Nenhum campo encontrado.</p>
              <p className="text-xs text-text-3/60">Tente buscar por outro termo ou cidade.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeFilter === "nearby" && userPos && (
            <p className="text-xs text-text-3">Ordenado por proximidade &bull; {fields.length} campo{fields.length !== 1 ? "s" : ""}</p>
          )}
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
                onClick={() => fetchFields(search, activeFilter, userPos, page + 1)}
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
