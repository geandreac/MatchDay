"use client";

import { useSyncExternalStore } from "react";

function getOnlineStatus() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function subscribeToOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribeToOnlineStatus, getOnlineStatus, () => true);
  const offline = !online;

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] px-4 py-2.5 text-center text-sm font-medium animate-fade-in bg-danger text-white"
    >
      Voce esta offline. Algumas funcionalidades podem nao estar disponiveis.
    </div>
  );
}
