/**
 * Security spec 3: API key authentication enforcement
 *
 * Per CLAUDE.md: "API keys solo via header `x-api-key` (no query params)".
 * Missing key, invalid key, or key passed as query param must all return 401.
 * A valid key for Tenant B must only return Tenant B's data even if A's
 * product IDs are probed via URL.
 */
import { test, expect } from '../fixtures/auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { apiClient, dbQuery } from '../fixtures/api';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

test.describe('security: API key spoofing / misuse', () => {
  test('no x-api-key header → 401', async () => {
    const res = await fetch(`${BASE}/api/v1/products`);
    expect(res.status).toBe(401);
  });

  test('invalid x-api-key string → 401', async () => {
    const res = await fetch(`${BASE}/api/v1/products`, {
      headers: { 'x-api-key': 'invalid-key-that-does-not-exist' },
    });
    expect(res.status).toBe(401);
  });

  test('API key passed as query param (not header) → 401', async ({ tenant }) => {
    const url = `${BASE}/api/v1/products?apiKey=${tenant.apiKey}`;
    const res = await fetch(url);
    expect(res.status).toBe(401);
  });

  test('Tenant B key cannot see Tenant A products', async ({ tenant: tenantA }) => {
    // Create Tenant B
    const supabase = createClient(
      process.env.E2E_SUPABASE_URL!,
      process.env.E2E_SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const bEmail = `e2e-spoof-${Date.now()}@aerolume.test`;
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: bEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    if (error || !userData?.user) throw new Error(`Failed to create tenant B user: ${error?.message}`);
    const bUserId = userData.user.id;

    let bTenantId: string | null = null;
    try {
      const b = await createTestTenant({ ownerUserId: bUserId, withApiKey: true });
      bTenantId = b.tenantId;
      const bApiKey = b.apiKey!;

      // Fetch products using Tenant B's API key — must only return B's products
      const api = apiClient(BASE, bApiKey);
      const res = await api.get<{ data: Array<{ id: string }> }>('/api/v1/products');
      expect(res.status).toBe(200);

      const returnedIds = res.body.data.map((p) => p.id);

      // All returned product IDs must belong to Tenant B
      if (returnedIds.length > 0) {
        const rows = await dbQuery<{ tenant_id: string }>(
          `SELECT DISTINCT tenant_id FROM products WHERE id = ANY($1::uuid[])`,
          [returnedIds],
        );
        for (const row of rows) {
          expect(row.tenant_id).toBe(bTenantId);
        }
      }

      // Tenant A's products must NOT appear in Tenant B's response
      const aProducts = await dbQuery<{ id: string }>(
        'SELECT id FROM products WHERE tenant_id = $1 LIMIT 3',
        [tenantA.tenantId],
      );
      for (const aProduct of aProducts) {
        expect(returnedIds).not.toContain(aProduct.id);
      }
    } finally {
      if (bTenantId) await cleanupTenant(bTenantId).catch(() => undefined);
      await supabase.auth.admin.deleteUser(bUserId).catch(() => undefined);
    }
  });
});
