"use client";

import type { ReactNode } from "react";
import { OfflineBanner } from "./offline-banner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
