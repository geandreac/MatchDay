import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

const sensitiveEndpoints = [
  "/api/auth",
  "/api/register",
  "/api/pix/criar",
  "/api/pix/verificar",
];

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
const apiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 });

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const pathname = request.nextUrl.pathname;

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
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
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
