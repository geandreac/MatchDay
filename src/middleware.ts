import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const sensitiveEndpoints = [
  "/api/auth",
  "/api/register",
  "/api/pix/criar",
  "/api/pix/verificar",
];

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const pathname = request.nextUrl.pathname;

  // Rate limiting em endpoints sensíveis
  if (sensitiveEndpoints.some((ep) => pathname.startsWith(ep))) {
    const check = loginLimiter(ip);
    if (!check.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
  } else if (pathname.startsWith("/api/")) {
    const check = apiLimiter(ip);
    if (!check.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
  }

  // Headers de segurança
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)",
  );

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
