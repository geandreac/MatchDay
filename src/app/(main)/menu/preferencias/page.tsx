"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

export default function Preferencias() {
  const { theme, toggle } = useTheme();
  const [lang, setLang] = useState("pt-BR");

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem("matchday-lang", newLang);
    // TODO: implementar i18n futuro
  }

  return (
    <div className="space-y-5">
      <Link href="/menu" className="flex items-center gap-2 text-sm text-text-3 hover:text-text transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </Link>

      <h2 className="text-lg font-bold text-text">Preferências</h2>

      {/* Aparência */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-4">Aparência</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { if (theme !== "dark") toggle(); }}
            className={`rounded-xl p-4 text-center transition-all duration-300 ${
              theme === "dark" ? "bg-primary/10 border-2 border-primary" : "bg-surface-2 border-2 border-border hover:border-primary/40"
            }`}>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-border">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <p className="text-sm font-medium text-text">Escuro</p>
          </button>
          <button onClick={() => { if (theme !== "light") toggle(); }}
            className={`rounded-xl p-4 text-center transition-all duration-300 ${
              theme === "light" ? "bg-primary/10 border-2 border-primary" : "bg-surface-2 border-2 border-border hover:border-primary/40"
            }`}>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-border">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
            </div>
            <p className="text-sm font-medium text-text">Claro</p>
          </button>
        </div>
      </div>

      {/* Idioma */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">Idioma</h3>
        <select value={lang} onChange={handleLangChange} className="input-base">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
        <p className="mt-2 text-xs text-text-3">Idioma salvo. A tradução completa será implementada em breve.</p>
      </div>
    </div>
  );
}
