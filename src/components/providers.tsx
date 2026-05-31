"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { OfflineBanner } from "./offline-banner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <ThemeProvider>
        <OfflineBanner />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
