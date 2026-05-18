"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [posError, setPosError] = useState(false);

  useEffect(() => {
    if (activeFilter === "nearby") {
      setPosError(false);
      setUserPos(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(p);
          fetchFields(search, activeFilter, p);
        },
        () => {
          setPosError(true);
          fetchFields(search, activeFilter, null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      const timer = setTimeout(() => fetchFields(search, activeFilter, null), 300);
      return () => clearTimeout(timer);
    }
  }, [search, activeFilter]);

  async function fetchFields(query: string, filter: string | null, pos: { lat: number; lng: number } | null) {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);

    if (filter === "city" && query) params.set("city", query);

    if (filter === "nearby" && pos) {
      params.set("lat", String(pos.lat));
      params.set("lng", String(pos.lng));
    }

    const res = await fetch(`/api/fields/search?${params}`);
    if (res.ok) {
      const data = await res.json();
      setFields(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  const filters = [
    { id: "name", label: "Nome" },
    { id: "city", label: "Cidade" },
    { id: "nearby", label: "Próximo" },
  ];

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative group">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-primary transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Buscar campos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: "44px" }} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button key={f.id} onClick={() => { setActiveFilter(activeFilter === f.id ? null : f.id); setFields([]); }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              activeFilter === f.id
                ? "bg-primary text-text glow-green-sm"
                : "bg-surface-2 text-text-3 border border-border hover:border-primary/40 hover:text-text-2"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {posError && activeFilter === "nearby" && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-xs text-danger flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Não foi possível acessar sua localização. Permita o acesso ou use outro filtro.
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <div className="absolute inset-0 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-primary" /></div>
          </div>
        </div>
      ) : fields.length > 0 ? (
        <div className="space-y-3 stagger">
          {fields.map((field, i) => (
            <Link key={field.id} href={`/campo/${field.id}`} className="card p-4 animate-fade-in-up block hover:border-primary/40 transition-all" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text truncate">{field.name}</h3>
                  <p className="text-xs text-text-3 truncate">{field.address}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-text-3">
                    <span>R$ {field.pricePerHour}/h</span>
                    <span>{field.startHour}h-{field.endHour}h</span>
                    {field.distanciaKm !== undefined && (
                      <span className="text-primary font-medium">{field.distanciaKm} km</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : search || activeFilter ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <p className="text-sm text-text-3">Nenhum campo encontrado.</p>
          <p className="text-xs text-text-3/60">Tente alterar os filtros ou buscar por outro termo.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <p className="text-sm text-text-3">Busque por campos de futebol</p>
          <p className="text-xs text-text-3/60">Use o campo de busca ou selecione um filtro acima.</p>
        </div>
      )}
    </div>
  );
}

