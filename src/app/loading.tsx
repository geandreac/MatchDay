export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full bg-primary/20" />
          </div>
        </div>
        <p className="text-sm text-text-3 animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}
