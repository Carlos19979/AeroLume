import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

// Cache limiters by "limit:windowSec" key to avoid recreating on every request
const limiterCache = new Map<string, Ratelimit>();

let redisClient: Redis | null = null;
let warnedMissingUpstash = false;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warnedMissingUpstash) {
      console.warn(
        '[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled',
      );
      warnedMissingUpstash = true;
    }
    return null;
  }
  redisClient = new Redis({ url, token });
  return redisClient;
}

/**
 * Check rate limit for a given identifier (typically the API key ID).
 * - If Upstash Redis is not configured, logs a warning once and allows the request through.
 * - Uses sliding window algorithm via Upstash Ratelimit.
 */
export async function checkRateLimit(
  identifier: string,
  limit = 100,
  windowSec = 3600,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 };
  }

  const cacheKey = `${limit}:${windowSec}`;
  let limiter = limiterCache.get(cacheKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: 'aerolume:rl',
    });
    limiterCache.set(cacheKey, limiter);
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
