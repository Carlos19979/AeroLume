/**
 * Unit/integration tests for cloneBaseCatalogToTenant.
 *
 * Requires E2E_DATABASE_URL to be set (loaded from apps/web/.env.local).
 * Run with: cd apps/web && pnpm test
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { isNull, inArray, eq, sql as dsql } from 'drizzle-orm';
import {
  cloneBaseCatalogToTenant,
  tenants,
  products,
  productPricingTiers,
  productConfigFields,
} from '@aerolume/db';

// Load .env.local so E2E_DATABASE_URL is available when running vitest locally.
dotenvConfig({ path: path.resolve(__dirname, '../../.env.local') });

// ---------------------------------------------------------------------------
// DB connection — built lazily once, torn down in afterAll.
// ---------------------------------------------------------------------------
let _client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle>;

function getDb() {
  if (!db) {
    const url = process.env.E2E_DATABASE_URL;
    if (!url) throw new Error('E2E_DATABASE_URL is not set. Add it to apps/web/.env.local');
    _client = postgres(url, { max: 3 });
    db = drizzle(_client);
  }
  return db;
}

beforeAll(() => {
  getDb(); // eagerly open connection so tests don't pay cold-start cost individually
});

afterAll(async () => {
  if (_client) {
    await _client.end({ timeout: 5 }).catch(() => undefined);
    _client = null;
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Insert a minimal tenant row and return its id. */
async function insertTenant(name: string): Promise<string> {
  const d = getDb();
  const slug = `clone-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const [row] = await d
    .insert(tenants)
    .values({ name, slug, plan: 'prueba', subscriptionStatus: 'trialing' })
    .returning({ id: tenants.id });
  return row.id;
}

/** Delete a tenant by id (cascades to products/tiers/fields). */
async function deleteTenant(tenantId: string): Promise<void> {
  const d = getDb();
  await d.execute(dsql`DELETE FROM tenants WHERE id = ${tenantId}::uuid`);
}

// ---------------------------------------------------------------------------
// Base-catalog counts (fetched once per suite run).
// ---------------------------------------------------------------------------
let baseProductCount = 0;
let baseTierCount = 0;
let baseFieldCount = 0;

beforeAll(async () => {
  const d = getDb();

  const baseProds = await d.select().from(products).where(isNull(products.tenantId));
  baseProductCount = baseProds.length;

  if (baseProductCount > 0) {
    const baseIds = baseProds.map((p) => p.id);
    const tiers = await d.select().from(productPricingTiers).where(inArray(productPricingTiers.productId, baseIds));
    baseTierCount = tiers.length;
    const fields = await d.select().from(productConfigFields).where(inArray(productConfigFields.productId, baseIds));
    baseFieldCount = fields.length;
  }
});

// ---------------------------------------------------------------------------
// Track created tenants so afterEach can clean up even on failure.
// ---------------------------------------------------------------------------
const createdTenantIds: string[] = [];

afterEach(async () => {
  // Clean up all tenants created during this test.
  for (const id of createdTenantIds.splice(0)) {
    await deleteTenant(id).catch(() => undefined);
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('cloneBaseCatalogToTenant', () => {
  it('happy path: returns the count of base products', async () => {
    const d = getDb();
    const tenantId = await insertTenant(`e2e-clone-test-${Date.now()}`);
    createdTenantIds.push(tenantId);

    const count = await cloneBaseCatalogToTenant(tenantId, d as Parameters<typeof cloneBaseCatalogToTenant>[1]);

    expect(count).toBe(baseProductCount);
  });

  it('happy path: cloned product rows match base catalog count', async () => {
    const d = getDb();
    const tenantId = await insertTenant(`e2e-clone-test-${Date.now()}`);
    createdTenantIds.push(tenantId);

    await cloneBaseCatalogToTenant(tenantId, d as Parameters<typeof cloneBaseCatalogToTenant>[1]);

    const clonedProds = await d.select().from(products).where(eq(products.tenantId, tenantId));
    expect(clonedProds.length).toBe(baseProductCount);
  });

  it('pricing tiers cloned: tier count matches base catalog', async () => {
    const d = getDb();
    const tenantId = await insertTenant(`e2e-clone-test-${Date.now()}`);
    createdTenantIds.push(tenantId);

    await cloneBaseCatalogToTenant(tenantId, d as Parameters<typeof cloneBaseCatalogToTenant>[1]);

    const clonedProds = await d.select().from(products).where(eq(products.tenantId, tenantId));
    const clonedIds = clonedProds.map((p) => p.id);

    let tierCount = 0;
    if (clonedIds.length > 0) {
      const tiers = await d.select().from(productPricingTiers).where(inArray(productPricingTiers.productId, clonedIds));
      tierCount = tiers.length;
    }

    expect(tierCount).toBe(baseTierCount);
  });

  it('config fields cloned: field count matches base catalog', async () => {
    const d = getDb();
    const tenantId = await insertTenant(`e2e-clone-test-${Date.now()}`);
    createdTenantIds.push(tenantId);

    await cloneBaseCatalogToTenant(tenantId, d as Parameters<typeof cloneBaseCatalogToTenant>[1]);

    const clonedProds = await d.select().from(products).where(eq(products.tenantId, tenantId));
    const clonedIds = clonedProds.map((p) => p.id);

    let fieldCount = 0;
    if (clonedIds.length > 0) {
      const fields = await d.select().from(productConfigFields).where(inArray(productConfigFields.productId, clonedIds));
      fieldCount = fields.length;
    }

    expect(fieldCount).toBe(baseFieldCount);
  });

  it.skip('empty base catalog: returns 0 without throwing', async () => {
    // Skipped: emptying the shared base catalog (tenantId IS NULL) in a test
    // is destructive and would break concurrent/sequential tests that rely on it.
    // To test this in isolation, seed a test DB with no base products and verify
    // cloneBaseCatalogToTenant returns 0.
  });

  it('idempotency: cloning same tenant twice throws unique constraint error', async () => {
    const d = getDb();
    const tenantId = await insertTenant(`e2e-clone-test-${Date.now()}`);
    createdTenantIds.push(tenantId);

    // First clone must succeed.
    await cloneBaseCatalogToTenant(tenantId, d as Parameters<typeof cloneBaseCatalogToTenant>[1]);

    // Second clone must throw — unique constraint on (tenant_id, slug).
    await expect(
      cloneBaseCatalogToTenant(tenantId, d as Parameters<typeof cloneBaseCatalogToTenant>[1]),
    ).rejects.toThrow();
  });
});
