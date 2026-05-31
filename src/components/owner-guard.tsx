"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export function OwnerGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="relative"><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>
          <p className="text-sm text-text-3">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "FIELD_OWNER") {
    redirect("/home");
  }

  return <>{children}</>;
}
