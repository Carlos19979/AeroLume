import { db, apiKeys, tenants, eq } from '@aerolume/db';
import { hashApiKey } from '@/lib/api-keys';

export type ApiKeyContext = {
  tenantId: string;
  keyId: string;
  scopes: string[];
  rateLimit: number;
};

type ValidationResult =
  | { ok: true; ctx: ApiKeyContext }
  | { ok: false; error: string; status: number };

/**
 * Validate an API key from a request.
 * Reads `x-api-key` header or `apiKey` query param.
 * Checks origin against tenant's allowed_origins.
 * Returns tenant context or an error.
 */
export async function validateApiKey(request: Request): Promise<ValidationResult> {
  const url = new URL(request.url);
  const rawKey =
    request.headers.get('x-api-key') ||
    url.searchParams.get('apiKey');

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

  // Check origin against tenant's allowed_origins
  const origin = request.headers.get('origin') || request.headers.get('referer');
  const [tenant] = await db
    .select({ allowedOrigins: tenants.allowedOrigins, webhookUrl: tenants.webhookUrl })
    .from(tenants)
    .where(eq(tenants.id, found.tenantId))
    .limit(1);

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

  return {
    ok: true,
    ctx: {
      tenantId: found.tenantId,
      keyId: found.id,
      scopes: found.scopes ?? ['read'],
      rateLimit: found.rateLimit ?? 1000,
    },
  };
}
