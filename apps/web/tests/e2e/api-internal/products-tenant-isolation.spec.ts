/**
 * Spec 4: Tenant isolation on /api/internal/products/[id]
 *
 * Tenant A (from the standard fixture) must not be able to GET, PUT, or DELETE
 * a product that belongs to Tenant B. Both tenants have their own cloned
 * catalog (23 products each). The internal routes filter by tenant_id inside
 * the WHERE clause, so cross-tenant access should:
 *   - GET    -> 404 "Not found"
 *   - PUT    -> 404 "Not found"
 *   - DELETE -> 200 with deleted:true (but no rows deleted, since filter misses)
 *
 * The test also asserts the product in tenant B is NOT modified or deleted.
 */
import { test, expect } from '../fixtures/auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { dbQuery } from '../fixtures/api';
import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

const TEST_PASSWORD = 'TestPassword123!';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/ }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

test.describe('api internal: tenant isolation for /api/internal/products/[id]', () => {
  test('tenant A cannot access, modify, or delete tenant B products', async ({
    page,
    tenant, // tenant A
  }) => {
    // --- Create a second, independent tenant B -----------------------------
    const supabaseUrl = process.env.E2E_SUPABASE_URL!;
    const serviceKey = process.env.E2E_SUPABASE_SERVICE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const bEmail = `e2e-iso-${Date.now()}@aerolume.test`;
    const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
      email: bEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (userErr || !userData?.user) throw new Error(`Failed to create tenant B user: ${userErr?.message}`);
    const bUserId = userData.user.id;

    let bTenantId: string | null = null;
    try {
      const b = await createTestTenant({ ownerUserId: bUserId, withApiKey: false });
      bTenantId = b.tenantId;

      // Pick a product owned by B.
      const bProducts = await dbQuery<{ id: string; name: string }>(
        `SELECT id, name FROM products WHERE tenant_id = $1 LIMIT 1`,
        [bTenantId],
      );
      expect(bProducts.length).toBe(1);
      const bProductId = bProducts[0].id;
      const originalName = bProducts[0].name;

      // Log in as tenant A (owner).
      await loginAs(page, tenant.email, tenant.password);

      // --- GET tenant B's product as A -> 404 -----------------------------
      const getRes = await page.request.get(`/api/internal/products/${bProductId}`);
      expect(getRes.status()).toBe(404);

      // --- PUT tenant B's product as A -> 404 -----------------------------
      const putRes = await page.request.put(`/api/internal/products/${bProductId}`, {
        data: { name: 'hacked', sailType: 'gvstd' },
        headers: { 'content-type': 'application/json' },
      });
      expect(putRes.status()).toBe(404);

      // Verify DB: product's name is untouched.
      const afterPut = await dbQuery<{ name: string; tenant_id: string }>(
        `SELECT name, tenant_id FROM products WHERE id = $1`,
        [bProductId],
      );
      expect(afterPut.length).toBe(1);
      expect(afterPut[0].name).toBe(originalName);
      expect(afterPut[0].tenant_id).toBe(bTenantId);

      // --- DELETE tenant B's product as A ---------------------------------
      // Current implementation returns 200 with {deleted: true} regardless of
      // whether the WHERE filter matched. What matters is the row still exists.
      const delRes = await page.request.delete(`/api/internal/products/${bProductId}`);
      expect([200, 204, 404]).toContain(delRes.status());

      const afterDelete = await dbQuery<{ id: string }>(
        `SELECT id FROM products WHERE id = $1 AND tenant_id = $2`,
        [bProductId, bTenantId],
      );
      expect(afterDelete.length).toBe(1);
    } finally {
      if (bTenantId) {
        await cleanupTenant(bTenantId).catch(() => undefined);
      }
      await supabase.auth.admin.deleteUser(bUserId).catch(() => undefined);
    }
  });
});
