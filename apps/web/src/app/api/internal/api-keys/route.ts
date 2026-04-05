import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, apiKeys, tenants, eq, and } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';
import { generateApiKey, hashApiKey, getKeyPrefix } from '@/lib/api-keys';
import { canCreateApiKeys } from '@/lib/plan-gates';

// GET: list keys for current tenant
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const keys = await db
    .select({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      scopes: apiKeys.scopes,
      rateLimit: apiKeys.rateLimit,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenant.id));

  return NextResponse.json({ data: keys });
}

// POST: create a new key
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  // Check plan
  const [full] = await db.select({ plan: tenants.plan, subscriptionStatus: tenants.subscriptionStatus }).from(tenants).where(eq(tenants.id, tenant.id)).limit(1);
  if (full && !canCreateApiKeys(full)) {
    return NextResponse.json({ error: 'Tu plan no permite crear API keys. Contacta para activar.' }, { status: 403 });
  }

  // Check if tenant already has a key
  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenant.id))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Ya tienes una API key. Revoca la actual para crear una nueva.' }, { status: 400 });
  }

  const body = await request.json();
  const name = body.name || 'Default';

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const [created] = await db
    .insert(apiKeys)
    .values({
      tenantId: tenant.id,
      keyHash,
      keyPrefix,
      name,
      scopes: ['read'],
      rateLimit: 1000,
    })
    .returning({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
    });

  // Return the raw key ONCE — it cannot be retrieved later
  return NextResponse.json({
    data: { ...created, rawKey },
  });
}

// DELETE: revoke a key
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get('id');
  if (!keyId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.tenantId, tenant.id)));

  return NextResponse.json({ data: { deleted: true } });
}
