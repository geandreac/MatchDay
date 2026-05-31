"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { formatarData } from "@/lib/validations";

const tabPaths = ["/home", "/search", "/bookings", "/menu"];

const backRoutes: Record<string, string> = {
  "/campo": "/search",
  "/owner/dashboard": "/menu",
  "/owner/cadastro": "/owner/dashboard",
  "/owner/campos": "/owner/dashboard",
  "/menu/dados": "/menu",
  "/menu/favoritos": "/menu",
  "/menu/avaliacoes": "/menu",
  "/menu/cartoes": "/menu",
  "/menu/seguranca": "/menu",
  "/menu/historico": "/menu",
  "/menu/preferencias": "/menu",
  "/reservar": "/bookings",
  "/termos": "/menu",
  "/privacidade": "/menu",
  "/admin": "/menu",
};

function getBackRoute(pathname: string): string {
  for (const [prefix, route] of Object.entries(backRoutes)) {
    if (pathname.startsWith(prefix)) return route;
  }
  return "/menu";
}

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const hoje = formatarData(new Date());

  const isSubpage = !tabPaths.includes(pathname) && pathname !== "/";
  const backHref = getBackRoute(pathname);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50" role="banner">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
            {isSubpage && (
              <Link
                href={backHref}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 hover:text-primary transition-all duration-200 text-text-2"
                aria-label="Voltar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
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
