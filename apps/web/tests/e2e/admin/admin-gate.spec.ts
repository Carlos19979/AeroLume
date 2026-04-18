/**
 * Spec 5: Admin gate — access control
 *
 * - Regular tenant user visiting /admin → redirected to /dashboard
 * - Regular tenant user calling /api/admin/* directly → 403
 * - Super-admin visiting /admin → 200, page loads OK
 * - Super-admin calling /api/admin/* → 200
 */
import { test, expect } from '@playwright/test';
import { ensureAdminUser, adminLogin, loginAs, deleteAdminUser } from '../fixtures/admin-auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { dbQuery } from '../fixtures/api';
import { createClient } from '@supabase/supabase-js';

const TEST_PASSWORD = 'TestPassword123!';

test.describe('admin: gate enforcement', () => {
  let adminUserId: string;
  let adminCreated: boolean;

  let regularUserId: string;
  let regularEmail: string;
  let regularTenantId: string;

  const supabase = createClient(
    process.env.E2E_SUPABASE_URL!,
    process.env.E2E_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  test.beforeAll(async () => {
    const result = await ensureAdminUser();
    adminUserId = result.userId;
    adminCreated = result.created;

    regularEmail = `e2e-gate-${Date.now()}@aerolume.test`;
    const { data: ud, error: ue } = await supabase.auth.admin.createUser({
      email: regularEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (ue || !ud?.user) throw new Error(`Regular user: ${ue?.message}`);
    regularUserId = ud.user.id;
    const { tenantId } = await createTestTenant({ ownerUserId: regularUserId });
    regularTenantId = tenantId;
  });

  test.afterAll(async () => {
    await cleanupTenant(regularTenantId).catch(() => undefined);
    await supabase.auth.admin.deleteUser(regularUserId).catch(() => undefined);
    if (adminCreated) {
      await deleteAdminUser(adminUserId);
    }
  });

  test('regular user visiting /admin is redirected to /dashboard', async ({ page }) => {
    await loginAs(page, regularEmail, TEST_PASSWORD);
    await page.goto('/admin');
    // Next.js redirect — should end up on /dashboard
    await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/dashboard/);
  });

  test('regular user gets 403 on /api/admin/tenants endpoint', async ({ page }) => {
    await loginAs(page, regularEmail, TEST_PASSWORD);
    // Use page.request so cookies (auth session) are included
    const res = await page.request.put('/api/admin/tenants/00000000-0000-0000-0000-000000000000', {
      data: { plan: 'pro' },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status()).toBe(403);
  });

  test('regular user gets 403 on /api/admin/boats endpoint', async ({ page }) => {
    await loginAs(page, regularEmail, TEST_PASSWORD);
    const res = await page.request.post('/api/admin/boats', {
      data: { model: 'HackerBoat', isMultihull: false },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status()).toBe(403);
  });

  test('super-admin can access /admin page', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin');
    // Should NOT redirect away
    await page.waitForURL(/\/admin(\/.*)?$/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/admin/);
    // Page should show "SUPERADMIN" badge
    await expect(page.locator('text=SUPERADMIN')).toBeVisible({ timeout: 10_000 });
  });

  test('super-admin gets 200 on /api/admin/boats POST', async ({ page }) => {
    await adminLogin(page);
    const model = `E2E-Gate-${Date.now()}`;
    const res = await page.request.post('/api/admin/boats', {
      data: { model, isMultihull: false },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status()).toBe(200);
    const { data } = await res.json() as { data: { id: string } };
    // Cleanup via DB
    await dbQuery(`DELETE FROM boats WHERE id = $1::uuid`, [data.id]).catch(() => undefined);
  });

  test('unauthenticated request to /api/admin/* gets 403', async ({ page }) => {
    // No login — fresh page context
    const res = await page.request.post('/api/admin/boats', {
      data: { model: 'AnonBoat', isMultihull: false },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status()).toBe(403);
  });
});
