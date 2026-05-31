"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 px-4" role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-danger">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-danger">Erro ao carregar</p>
        <p className="text-xs text-text-3 mt-1 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
