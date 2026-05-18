"use client";

import { useEffect } from "react";

export function useNotificacoes() {
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function notificar(titulo: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
      new Notification(titulo, { icon: "/icon-192.png", ...options });
    }
  }

  return { notificar };
}
