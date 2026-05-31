import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

let redis: Redis | null = null;
let redisRatelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch {
  redis = null;
}

interface RatelimitResult {
  allowed: boolean;
  remaining: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

function memoryRatelimit(key: string, config: RateLimitConfig): RatelimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1 };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count };
}

async function redisRatelimitCheck(key: string, config: RateLimitConfig): Promise<RatelimitResult> {
  if (!redisRatelimit) {
    redisRatelimit = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(config.max, `${Math.ceil(config.windowMs / 1000)} s`),
      prefix: "matchday:rl",
    });
  }

  try {
    const result = await redisRatelimit.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
    };
  } catch {
    return memoryRatelimit(key, config);
  }
}

export function createRateLimiter(config: RateLimitConfig) {
  const hasRedis = redis !== null;

  return {
    async check(key: string): Promise<RatelimitResult> {
      if (hasRedis) {
        return redisRatelimitCheck(key, config);
      }
      return memoryRatelimit(key, config);
    },
  };
}

export async function checkRateLimitIP(
  request: Request,
  windowMs: number,
  max: number,
): Promise<RatelimitResult> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";
  const limiter = createRateLimiter({ windowMs, max });
  return limiter.check(ip);
}
