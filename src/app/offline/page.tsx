"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-2 border border-border">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-text mb-2">Sem Conexão</h1>
      <p className="text-sm text-text-3 max-w-xs">
        Você está offline. Conecte-se à internet e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary mt-6"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
