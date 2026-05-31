"use client";

export default function Cartoes() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-text">Meus Cartões</h2>

      <div className="flex flex-col items-center gap-4 py-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div>
        <p className="text-sm text-text-3">Nenhum cartão salvo.</p>
        <p className="text-xs text-text-3/60 text-center max-w-xs">Os pagamentos atualmente são feitos via PIX. Cartões estarão disponíveis em breve.</p>
      </div>
    </div>
  );
}

