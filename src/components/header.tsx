"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { formatarData } from "@/lib/validations";

const tabPaths = ["/home", "/search", "/bookings", "/menu"];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const hoje = formatarData(new Date());

  const isSubpage = !tabPaths.includes(pathname) && pathname !== "/";

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {isSubpage && (
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 hover:text-primary transition-all duration-200 text-text-2"
              aria-label="Voltar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-text-3">{hoje}</p>
            <h1 className="mt-0.5 text-lg font-bold text-text">
              Olá, <span className="gradient-text">{session?.user?.name?.split(" ")[0] ?? "Visitante"}</span>
            </h1>
          </div>
        </div>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 glow-green-sm">
            <span className="text-sm font-bold text-primary">
              {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        </div>
      </div>
    </header>
  );
}
