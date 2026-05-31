import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  const response = NextResponse.next();

  if (MUTATING_METHODS.has(method) && !CSRF_EXEMPT.has(pathname)) {
    const csrfProtected = CSRF_PROTECTED.some((p) => pathname.startsWith(p));
    if (csrfProtected) {
      const origin = request.headers.get("origin") ?? "";
      const host = request.headers.get("host") ?? "";
      const isSameOrigin = origin.includes(host);

      const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
      const headerToken = request.headers.get(CSRF_HEADER);

      if (cookieToken && headerToken) {
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
