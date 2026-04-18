import crypto from 'node:crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql as dsql } from 'drizzle-orm';
import {
  tenants,
  tenantMembers,
  apiKeys,
  cloneBaseCatalogToTenant,
} from '@aerolume/db';

export type TenantPlan = 'prueba' | 'pro' | 'enterprise';

export interface CreateTestTenantOpts {
  plan?: TenantPlan;
  trialEndsAt?: Date | null;
  withApiKey?: boolean;
  ownerUserId: string;
  name?: string;
}

export interface CreatedTestTenant {
  tenantId: string;
  apiKey?: string;
}

/**
 * Local Drizzle connection scoped to E2E tests. We build it lazily so tests that
 * don't hit the DB don't pay the connection cost.
 *
 * IMPORTANT: per the seed script pattern, we create our own postgres connection
 * using E2E_DATABASE_URL and pass this `db` explicitly to cloneBaseCatalogToTenant
 * to sidestep env-loading order bugs.
 */
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.E2E_DATABASE_URL;
    if (!url) throw new Error('E2E_DATABASE_URL not set');
    _client = postgres(url, { max: 3 });
    _db = drizzle(_client);
  }
  return _db;
}

export async function closeTenantDb(): Promise<void> {
  if (_client) {
    await _client.end({ timeout: 2 }).catch(() => undefined);
    _client = null;
    _db = null;
  }
}

function randomSlug(prefix = 'e2e'): string {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}-${Date.now()}`;
}

/**
 * Creates a tenant in the DB, registers the provided user as `owner` in tenant_members,
 * clones the base catalog, and optionally creates an API key. Returns identifiers.
 */
export async function createTestTenant(opts: CreateTestTenantOpts): Promise<CreatedTestTenant> {
  const db = getDb();
  const slug = randomSlug();
  const name = opts.name ?? `E2E Tenant ${slug}`;
  const plan: TenantPlan = opts.plan ?? 'prueba';
  const trialEndsAt =
    opts.trialEndsAt === undefined
      ? new Date(Date.now() + 14 * 86_400_000) // default: 14-day trial
      : opts.trialEndsAt;

  // Insert tenant
  const [inserted] = await db
    .insert(tenants)
    .values({
      name,
      slug,
      plan,
      subscriptionStatus: plan === 'prueba' ? 'trialing' : 'active',
      trialEndsAt: trialEndsAt ?? undefined,
    })
    .returning({ id: tenants.id });

  const tenantId = inserted.id;

  // Add owner
  await db.insert(tenantMembers).values({
    tenantId,
    userId: opts.ownerUserId,
    role: 'owner',
  });

  // Clone base catalog — pass db explicitly to avoid env-loading bug
  await cloneBaseCatalogToTenant(tenantId, db as unknown as Parameters<typeof cloneBaseCatalogToTenant>[1]);

  let apiKey: string | undefined;
  if (opts.withApiKey) {
    apiKey = await createApiKey(tenantId, 'E2E Default');
  }

  return { tenantId, apiKey };
}

/**
 * Cleanup tenant — cascade deletes products, quotes, api_keys, tenant_members.
 */
export async function cleanupTenant(tenantId: string): Promise<void> {
  const db = getDb();
  await db.execute(dsql`DELETE FROM tenants WHERE id = ${tenantId}::uuid`);
}

/**
 * Generates a new API key for the tenant. Returns the raw (unhashed) key — the caller
 * is responsible for using it immediately (only the hash is stored).
 */
export async function createApiKey(tenantId: string, name: string): Promise<string> {
  const db = getDb();
  const raw = `ak_${crypto.randomBytes(20).toString('hex')}`; // 40 hex chars
  const keyHash = crypto.createHash('sha256').update(raw).digest('hex');
  const keyPrefix = raw.slice(0, 11); // "ak_" + first 8 chars of hex

  await db.insert(apiKeys).values({
    tenantId,
    keyHash,
    keyPrefix,
    name,
    scopes: ['read'],
    rateLimit: 1000,
  });

  return raw;
}

export async function extendTrial(tenantId: string, days: number): Promise<void> {
  const db = getDb();
  const when = new Date(Date.now() + days * 86_400_000);
  await db
    .update(tenants)
    .set({ trialEndsAt: when })
    .where(dsql`${tenants.id} = ${tenantId}::uuid`);
}

export async function expireTrial(tenantId: string): Promise<void> {
  const db = getDb();
  const when = new Date(Date.now() - 86_400_000);
  await db
    .update(tenants)
    .set({ trialEndsAt: when })
    .where(dsql`${tenants.id} = ${tenantId}::uuid`);
}

export async function setPlan(tenantId: string, plan: TenantPlan): Promise<void> {
  const db = getDb();
  await db
    .update(tenants)
    .set({ plan, subscriptionStatus: 'active' })
    .where(dsql`${tenants.id} = ${tenantId}::uuid`);
}
