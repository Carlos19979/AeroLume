import { db, apiKeys, eq } from '@aerolume/db';
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

  // Update last_used_at (fire and forget — don't block the response)
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
