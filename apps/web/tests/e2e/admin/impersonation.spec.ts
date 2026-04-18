/**
 * Spec 3: Admin impersonation flow
 *
 * - Super-admin clicks "Impersonate" on tenant X → session context switches to X
 *   (banner visible, /api/internal/products returns X's products)
 * - "Stop impersonating" link clears the cookie → session reverts to admin context
 * - Non-admin user calling /api/admin/impersonate directly → 403
 */
import { test, expect } from '@playwright/test';
import { dbQuery } from '../fixtures/api';
import { ensureAdminUser, adminLogin, loginAs, deleteAdminUser } from '../fixtures/admin-auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { createClient } from '@supabase/supabase-js';
import { TID } from '../fixtures/selectors';

const TEST_PASSWORD = 'TestPassword123!';

test.describe('admin: impersonation', () => {
  let adminUserId: string;
  let adminCreated: boolean;

  let targetTenantId: string;
  let targetUserId: string;

  let regularTenantId: string;
  let regularUserId: string;
  let regularEmail: string;

  const supabase = createClient(
    process.env.E2E_SUPABASE_URL!,
    process.env.E2E_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  test.beforeAll(async () => {
    const result = await ensureAdminUser();
    adminUserId = result.userId;
    adminCreated = result.created;

    // Target tenant to impersonate
    const targetEmail = `e2e-target-${Date.now()}@aerolume.test`;
    const { data: td, error: te } = await supabase.auth.admin.createUser({
      email: targetEmail, password: TEST_PASSWORD, email_confirm: true,
    });
    if (te || !td?.user) throw new Error(`Target user: ${te?.message}`);
    targetUserId = td.user.id;
    const t = await createTestTenant({ ownerUserId: targetUserId });
    targetTenantId = t.tenantId;

    // Regular (non-admin) tenant user
    regularEmail = `e2e-reg-${Date.now()}@aerolume.test`;
    const { data: rd, error: re } = await supabase.auth.admin.createUser({
      email: regularEmail, password: TEST_PASSWORD, email_confirm: true,
    });
    if (re || !rd?.user) throw new Error(`Regular user: ${re?.message}`);
    regularUserId = rd.user.id;
    const r = await createTestTenant({ ownerUserId: regularUserId });
    regularTenantId = r.tenantId;
  });

  test.afterAll(async () => {
    await cleanupTenant(targetTenantId).catch(() => undefined);
    await supabase.auth.admin.deleteUser(targetUserId).catch(() => undefined);
    await cleanupTenant(regularTenantId).catch(() => undefined);
    await supabase.auth.admin.deleteUser(regularUserId).catch(() => undefined);
    if (adminCreated) {
      await deleteAdminUser(adminUserId);
    }
  });

  test('admin can impersonate tenant — banner appears and products belong to target', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/admin/tenants/${targetTenantId}`);

    // Click "Abrir en nueva pestaña" impersonate link — but instead of opening a new tab
    // we navigate directly to the impersonate URL in the same page.
    const impersonateHref = `/api/admin/impersonate?tenantId=${targetTenantId}`;
    await page.goto(impersonateHref);

    // Should redirect to /dashboard
    await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });

    // Banner should be visible
    const banner = page.locator(`[data-testid="${TID.admin.impersonateBanner}"]`);
    await expect(banner).toBeVisible({ timeout: 10_000 });
    await expect(banner).toContainText('impersonaci');

    // Products from /api/internal/products should return data for the impersonated tenant.
    // The API response doesn't include tenantId, so we verify:
    // 1. The API returns 200 (not 403/401 — impersonation is working)
    // 2. The product IDs in the response all belong to targetTenantId in the DB
    const productsRes = await page.request.get('/api/internal/products');
    expect(productsRes.status()).toBe(200);
    const { data: products } = await productsRes.json() as { data: { id: string }[] };
    expect(products.length).toBeGreaterThan(0);

    // Every returned product ID should belong to target tenant in DB
    for (const p of products) {
      const [dbRow] = await dbQuery<{ tenant_id: string }>(
        `SELECT tenant_id FROM products WHERE id = $1::uuid`,
        [p.id],
      );
      expect(dbRow.tenant_id).toBe(targetTenantId);
    }
  });

  test('stop impersonating reverts to admin context', async ({ page }) => {
    await adminLogin(page);
    // Start impersonating
    await page.goto(`/api/admin/impersonate?tenantId=${targetTenantId}`);
    await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
    await expect(page.locator(`[data-testid="${TID.admin.impersonateBanner}"]`)).toBeVisible();

    // Click stop impersonate
    const stopLink = page.locator(`[data-testid="${TID.admin.stopImpersonate}"]`);
    await expect(stopLink).toBeVisible();
    await stopLink.click();

    // Should redirect to /admin/tenants
    await page.waitForURL(/\/admin(\/.*)?$/, { timeout: 15_000 });

    // Banner should be gone
    await expect(page.locator(`[data-testid="${TID.admin.impersonateBanner}"]`)).not.toBeVisible();
  });

  test('non-admin user cannot call impersonate endpoint directly — 403', async ({ page }) => {
    await loginAs(page, regularEmail, TEST_PASSWORD);

    // Direct GET to /api/admin/impersonate as non-admin
    const res = await page.request.get(
      `/api/admin/impersonate?tenantId=${targetTenantId}`,
      { maxRedirects: 0 },
    );
    // Should be 403 or redirect to dashboard (not 200 with impersonation working)
    expect([302, 403]).toContain(res.status());

    // If we actually followed the redirect (browser mode), verify no banner
    if (res.status() === 302) {
      const location = res.headers()['location'] ?? '';
      // Should NOT redirect to /dashboard with impersonation active
      expect(location).not.toContain(`impersonate`);
    }
  });
});
