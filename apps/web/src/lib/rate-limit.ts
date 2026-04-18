import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

// Cache limiters by "limit:windowSec" key to avoid recreating on every request
const limiterCache = new Map<string, Ratelimit>();

let warnedMissingKv = false;

/**
 * Check rate limit for a given identifier (typically the API key ID).
 * - If KV_REST_API_URL is not set, logs a warning once and allows the request through.
 * - Uses sliding window algorithm via Upstash Ratelimit + Vercel KV.
 */
export async function checkRateLimit(
  identifier: string,
  limit = 100,
  windowSec = 3600,
): Promise<RateLimitResult> {
  if (!process.env.KV_REST_API_URL) {
    if (!warnedMissingKv) {
      console.warn('[rate-limit] KV_REST_API_URL not set — rate limiting disabled');
      warnedMissingKv = true;
    }
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 };
  }

  const cacheKey = `${limit}:${windowSec}`;
  let limiter = limiterCache.get(cacheKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: kv,
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
