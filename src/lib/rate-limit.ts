const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function rateLimit(options: RateLimitOptions) {
  return function check(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs });
      return { allowed: true, remaining: options.max - 1 };
    }

    if (entry.count >= options.max) {
      return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: options.max - entry.count };
  };
}

export function rateLimitIP(request: Request, windowMs: number, max: number) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";
  const check = rateLimit({ windowMs, max });
  return check(ip);
}
