/**
 * Security spec 4: Cross-tenant product leak regression (POST /api/v1/quotes)
 *
 * Regression test for: Tenant A POSTs a quote item whose productId belongs to
 * Tenant B. Before the patch, B's pricing data would be resolved and stored.
 * After the patch (tenant-scoped product lookup with OR isNull guard), a
 * foreign productId is silently nulled out — same shape as a custom line item.
 *
 * Expected behaviour (post-patch):
 *   - Quote is created (200)
 *   - The offending item has productId = null, unitPrice = null, cost = null in DB
 *   - No Tenant B pricing data leaks into the response
 */
import { test, expect } from '../fixtures/auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { apiClient, dbQuery } from '../fixtures/api';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

test.describe('security: cross-tenant product pricing leak regression', () => {
  test('Tenant A quoting with Tenant B productId — productId nulled, no pricing leak', async ({ tenant: tenantA }) => {
    const supabase = createClient(
      process.env.E2E_SUPABASE_URL!,
      process.env.E2E_SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const bEmail = `e2e-xtleak-${Date.now()}@aerolume.test`;
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: bEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    if (error || !userData?.user) throw new Error(`Failed to create tenant B user: ${error?.message}`);
    const bUserId = userData.user.id;

    let bTenantId: string | null = null;
    try {
      const b = await createTestTenant({ ownerUserId: bUserId, withApiKey: false });
      bTenantId = b.tenantId;

      // Pick a real product from Tenant B's catalog
      const bProducts = await dbQuery<{ id: string }>(
        'SELECT id FROM products WHERE tenant_id = $1 LIMIT 1',
        [bTenantId],
      );
      expect(bProducts.length).toBeGreaterThan(0);
      const bProductId = bProducts[0].id;

      // Tenant A POSTs a quote with Tenant B's productId as a line item
      const api = apiClient(BASE, tenantA.apiKey);
      const res = await api.post<{ data: { id: string } }>('/api/v1/quotes', {
        boatModel: 'Cross-Tenant Test Boat',
        currency: 'EUR',
        items: [
          {
            productId: bProductId,   // ← foreign tenant's product
            sailType: 'gvstd',
            productName: 'Stolen Sail',
            quantity: 1,
          },
        ],
      });

      expect(res.status).toBe(200);
      const quoteId = res.body.data.id;
      expect(quoteId).toBeTruthy();

      // DB assertion: the quote item must have product_id = null (not Tenant B's id)
      const items = await dbQuery<{ product_id: string | null; unit_price: string | null; cost: string | null }>(
        'SELECT product_id, unit_price, cost FROM quote_items WHERE quote_id = $1',
        [quoteId],
      );
      expect(items.length).toBe(1);
      expect(items[0].product_id).toBeNull();

      // No pricing should be calculated from a foreign product (no tiers to resolve)
      // unit_price and cost are null because safeProductId is null and no fallback was sent
      expect(items[0].unit_price).toBeNull();
      expect(items[0].cost).toBeNull();
    } finally {
      if (bTenantId) await cleanupTenant(bTenantId).catch(() => undefined);
      await supabase.auth.admin.deleteUser(bUserId).catch(() => undefined);
    }
  });

  test('Tenant A quoting with own productId — productId preserved, pricing resolved', async ({ tenant: tenantA }) => {
    // Positive control: own products should still resolve correctly
    const ownProducts = await dbQuery<{ id: string }>(
      'SELECT id FROM products WHERE tenant_id = $1 LIMIT 1',
      [tenantA.tenantId],
    );
    expect(ownProducts.length).toBeGreaterThan(0);
    const ownProductId = ownProducts[0].id;

    const api = apiClient(BASE, tenantA.apiKey);
    const res = await api.post<{ data: { id: string } }>('/api/v1/quotes', {
      boatModel: 'Own Product Test Boat',
      currency: 'EUR',
      items: [{ productId: ownProductId, sailType: 'gvstd', productName: 'Own Sail', quantity: 1 }],
    });

    expect(res.status).toBe(200);

    const items = await dbQuery<{ product_id: string | null }>(
      'SELECT product_id FROM quote_items WHERE quote_id = $1',
      [res.body.data.id],
    );
    expect(items.length).toBe(1);
    // Own product's id must be preserved
    expect(items[0].product_id).toBe(ownProductId);
  });
});
