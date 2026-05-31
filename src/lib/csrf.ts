import crypto from "crypto";

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCSRF(token: string | null, storedToken: string | null): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}
