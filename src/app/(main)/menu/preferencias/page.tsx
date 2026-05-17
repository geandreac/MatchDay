"use client";

import { useState, useEffect } from "react";

export default function Preferencias() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState("pt-BR");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function toggleTheme(t: "dark" | "light") {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-text">Preferências</h2>

      {/* Aparência */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-4">Aparência</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => toggleTheme("dark")}
            className={`rounded-xl p-4 text-center transition-all duration-300 ${
              theme === "dark" ? "bg-primary/10 border-2 border-primary" : "bg-surface-2 border-2 border-border hover:border-primary/40"
            }`}>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-border">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <p className="text-sm font-medium text-text">Escuro</p>
          </button>
          <button onClick={() => toggleTheme("light")}
            className={`rounded-xl p-4 text-center transition-all duration-300 ${
              theme === "light" ? "bg-primary/10 border-2 border-primary" : "bg-surface-2 border-2 border-border hover:border-primary/40"
            }`}>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-border">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </div>
            <p className="text-sm font-medium text-text">Claro</p>
          </button>
        </div>
      </div>

      {/* Idioma */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-2 tracking-wide uppercase mb-3">Idioma</h3>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="input-base">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
}

