"use client";

function getCSRFToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? match[1] : "";
}

export function csrfFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? "GET";
  const isMutating = ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());

  const headers = new Headers(init?.headers);
  if (isMutating) {
    headers.set("x-csrf-token", getCSRFToken());
  }
  if (!headers.has("Content-Type") && isMutating) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...init, headers });
}

export { getCSRFToken };
