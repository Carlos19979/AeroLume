import { NextResponse } from 'next/server';
import { db, apiKeys, tenants, eq } from '@aerolume/db';
import { hashApiKey } from '@/lib/api-keys';
import { checkRateLimit, type RateLimitResult } from '@/lib/rate-limit';

export type ApiKeyContext = {
  tenantId: string;
  keyId: string;
  scopes: string[];
  rateLimit: number;
  rateLimitResult: RateLimitResult;
};

type ValidationResult =
  | { ok: true; ctx: ApiKeyContext }
  | { ok: false; error: string; status: number }
  | { ok: false; rateLimited: true; response: NextResponse };

/**
 * Validate an API key from a request.
 * Reads `x-api-key` header.
 * Checks origin against tenant's allowed_origins.
 * Returns tenant context or an error.
 */
export async function validateApiKey(request: Request): Promise<ValidationResult> {
  const rawKey = request.headers.get('x-api-key');

  if (!rawKey) {
    return { ok: false, error: 'Missing API key', status: 401 };
  }

  if (!rawKey.startsWith('ak_')) {
    return { ok: false, error: 'Invalid API key format', status: 401 };
  }

  const keyHash = hashApiKey(rawKey);

  const [found] = await db
    .select({
      id: apiKeys.id,
      tenantId: apiKeys.tenantId,
      scopes: apiKeys.scopes,
      rateLimit: apiKeys.rateLimit,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!found) {
    return { ok: false, error: 'Invalid API key', status: 401 };
  }

  if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
    return { ok: false, error: 'API key expired', status: 401 };
  }

  // Check tenant status — widget works for pro/active, active trial, or canceled-in-grace
  const origin = request.headers.get('origin') || request.headers.get('referer');
  const [tenant] = await db
    .select({ allowedOrigins: tenants.allowedOrigins, webhookUrl: tenants.webhookUrl, plan: tenants.plan, subscriptionStatus: tenants.subscriptionStatus, trialEndsAt: tenants.trialEndsAt, cancelationGraceEndsAt: tenants.cancelationGraceEndsAt })
    .from(tenants)
    .where(eq(tenants.id, found.tenantId))
    .limit(1);

  if (tenant) {
    const isPro = tenant.plan === 'pro' && tenant.subscriptionStatus === 'active';
    const isActiveTrial = tenant.plan === 'prueba' && tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date();
    const isCanceledInGrace =
      tenant.subscriptionStatus === 'canceled' &&
      tenant.cancelationGraceEndsAt &&
      new Date(tenant.cancelationGraceEndsAt) > new Date();
    if (!isPro && !isActiveTrial && !isCanceledInGrace) {
      return { ok: false, error: 'Account inactive', status: 403 };
    }
  }

  if (tenant?.allowedOrigins && tenant.allowedOrigins.length > 0 && origin) {
    const originHost = origin.replace(/\/$/, '');
    const allowed = tenant.allowedOrigins.some(
      (ao) => originHost === ao.replace(/\/$/, '') || originHost.endsWith('.' + new URL(ao).hostname)
    );
    if (!allowed) {
      return { ok: false, error: 'Origin not allowed', status: 403 };
    }
  }

  // Update last_used_at (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, found.id))
    .then(() => {})
    .catch(() => {});

  const keyRateLimit = found.rateLimit ?? 1000;
  const rateLimitResult = await checkRateLimit(found.id, keyRateLimit);

  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 },
    );
    response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.reset));
    return { ok: false, rateLimited: true, response };
  }

  return {
    ok: true,
    ctx: {
      tenantId: found.tenantId,
      keyId: found.id,
      scopes: found.scopes ?? ['read'],
      rateLimit: keyRateLimit,
      rateLimitResult,
    },
  };
}
