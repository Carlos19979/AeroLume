/**
 * Security spec: Rate limiting via Upstash Ratelimit + Upstash Redis.
 *
 * Skipped automatically when UPSTASH_REDIS_REST_URL is not configured (local dev without KV).
 * To run locally: set UPSTASH_REDIS_REST_URL and KV_REST_API_TOKEN in your .env.local.
 */
import { test, expect } from '../fixtures/auth';
import { sql as dsql } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { apiKeys } from '@aerolume/db';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

// Skip entire file if KV is not configured
test.skip(!process.env.UPSTASH_REDIS_REST_URL, 'UPSTASH_REDIS_REST_URL not configured — rate limiting skipped');

async function getProductsWithKey(apiKey: string) {
  return fetch(`${BASE}/api/v1/products`, {
    method: 'GET',
    headers: { 'x-api-key': apiKey },
  });
}

/**
 * Set rateLimit on an API key identified by prefix (first 11 chars of raw key).
 */
async function setApiKeyRateLimit(rawKey: string, limit: number): Promise<void> {
  const url = process.env.E2E_DATABASE_URL;
  if (!url) throw new Error('E2E_DATABASE_URL not set');
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  const keyPrefix = rawKey.slice(0, 11);
  await db
    .update(apiKeys)
    .set({ rateLimit: limit })
    .where(dsql`${apiKeys.keyPrefix} = ${keyPrefix}`);
  await client.end({ timeout: 2 }).catch(() => undefined);
}

test.describe('security: rate limiting', () => {
  test('enforces per-key rate limit and returns X-RateLimit-* headers', async ({ tenant }) => {
    const LIMIT = 3;
    await setApiKeyRateLimit(tenant.apiKey, LIMIT);

    // First LIMIT requests should succeed with decrementing X-RateLimit-Remaining
    const successes: Response[] = [];
    for (let i = 0; i < LIMIT; i++) {
      const res = await getProductsWithKey(tenant.apiKey);
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe(String(LIMIT));
      const remaining = Number(res.headers.get('X-RateLimit-Remaining'));
      expect(remaining).toBe(LIMIT - 1 - i);
      successes.push(res);
    }
    expect(successes).toHaveLength(LIMIT);

    // Next request should be rejected with 429
    const limited = await getProductsWithKey(tenant.apiKey);
    expect(limited.status).toBe(429);
    expect(limited.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(limited.headers.get('X-RateLimit-Limit')).toBe(String(LIMIT));
    const body = await limited.json() as { error: string };
    expect(body.error).toBe('Rate limit exceeded');
  });
});
