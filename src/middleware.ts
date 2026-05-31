import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import crypto from "crypto";

const sensitiveEndpoints = [
  "/api/auth",
  "/api/register",
  "/api/pix/criar",
  "/api/pix/verificar",
];

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
const apiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 });

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);
const CSRF_PROTECTED = [
  "/api/register",
  "/api/reservar/criar",
  "/api/reservar/cancelar",
  "/api/pix/criar",
  "/api/pix/verificar",
  "/api/upload",
  "/api/ratings",
  "/api/favorites",
  "/api/fields",
  "/api/user",
  "/api/contact",
  "/api/fields/",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];
const CSRF_EXEMPT = new Set(["/api/pix/webhook"]);

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const pathname = request.nextUrl.pathname;
  const method = request.method;

  if (sensitiveEndpoints.some((ep) => pathname.startsWith(ep))) {
    const { allowed } = await loginLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas requisicoes. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
  } else if (pathname.startsWith("/api/")) {
    const { allowed } = await apiLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas requisicoes. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
  }

  const response = NextResponse.next();

  if (MUTATING_METHODS.has(method) && !CSRF_EXEMPT.has(pathname)) {
    const csrfProtected = CSRF_PROTECTED.some((p) => pathname.startsWith(p));
    if (csrfProtected) {
      const origin = request.headers.get("origin") ?? "";
      const host = request.headers.get("host") ?? "";
      const isSameOrigin = origin.includes(host);

      const hasCSRFToken =
        request.cookies.get(CSRF_COOKIE)?.value &&
        request.headers.get(CSRF_HEADER);

      const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
      const headerToken = request.headers.get(CSRF_HEADER);

      if (hasCSRFToken && cookieToken && headerToken) {
        if (!safeCompare(cookieToken, headerToken)) {
          return NextResponse.json(
            { error: "Token CSRF invalido." },
            { status: 403 },
          );
        }
      } else if (!isSameOrigin) {
        return NextResponse.json(
          { error: "Token CSRF obrigatorio para requisicoes cross-origin." },
          { status: 403 },
        );
      }
    }
  } else if (method === "GET" && pathname.startsWith("/api/")) {
    const existing = request.cookies.get(CSRF_COOKIE)?.value;
    if (!existing) {
      const token = generateToken();
      response.cookies.set(CSRF_COOKIE, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60,
      });
    }
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://*.supabase.co data:; connect-src 'self' https://api.mercadopago.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)",
  );

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
