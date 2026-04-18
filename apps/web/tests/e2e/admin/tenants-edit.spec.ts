/**
 * Spec 2: Admin panel – tenant detail / edit (/admin/tenants/[id])
 *
 * - Change plan (prueba → pro). Assert DB row updated.
 * - Change subscription status. Assert DB.
 * - Non-existent tenant id → 404 page.
 */
import { test, expect } from '@playwright/test';
import { dbQuery } from '../fixtures/api';
import { ensureAdminUser, adminLogin, deleteAdminUser } from '../fixtures/admin-auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { createClient } from '@supabase/supabase-js';
import { TID } from '../fixtures/selectors';

const TEST_PASSWORD = 'TestPassword123!';

test.describe('admin: tenant detail edit', () => {
  let adminUserId: string;
  let adminCreated: boolean;

  // Test tenant provisioned for each test
  let tenantId: string;
  let tenantUserId: string;
  const supabase = createClient(
    process.env.E2E_SUPABASE_URL!,
    process.env.E2E_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  test.beforeAll(async () => {
    const result = await ensureAdminUser();
    adminUserId = result.userId;
    adminCreated = result.created;

    // Provision a fresh tenant on plan=prueba
    const email = `e2e-edit-${Date.now()}@aerolume.test`;
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !userData?.user) throw new Error(`Failed to create tenant user: ${error?.message}`);
    tenantUserId = userData.user.id;
    const created = await createTestTenant({ ownerUserId: tenantUserId, plan: 'prueba' });
    tenantId = created.tenantId;
  });

  test.afterAll(async () => {
    await cleanupTenant(tenantId).catch(() => undefined);
    await supabase.auth.admin.deleteUser(tenantUserId).catch(() => undefined);
    if (adminCreated) {
      await deleteAdminUser(adminUserId);
    }
  });

  test('change plan prueba → pro and verify DB', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/admin/tenants/${tenantId}`);
    await page.waitForSelector(`[data-testid="${TID.admin.tenantRow(tenantId)}"], [data-testid="admin-tenant-plan"]`, { timeout: 15_000 });

    // Click "Pro" button in the plan panel
    const planPanel = page.locator('[data-testid="admin-tenant-plan"]');
    await expect(planPanel).toBeVisible();
    await planPanel.getByRole('button', { name: /^Pro/ }).click();

    // Wait for the button to re-render (the current plan button gets "(actual)" label)
    await expect(planPanel.getByRole('button', { name: /Pro.*actual/i })).toBeVisible({ timeout: 10_000 });

    // Assert DB
    const [row] = await dbQuery<{ plan: string }>(
      `SELECT plan FROM tenants WHERE id = $1`,
      [tenantId],
    );
    expect(row.plan).toBe('pro');
  });

  test('change subscription status and verify DB', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/admin/tenants/${tenantId}`);
    await page.waitForSelector('[data-testid="admin-tenant-status"]', { timeout: 15_000 });

    const statusPanel = page.locator('[data-testid="admin-tenant-status"]');
    await expect(statusPanel).toBeVisible();

    // Read current DB status to pick a different target
    const [current] = await dbQuery<{ subscription_status: string }>(
      `SELECT subscription_status FROM tenants WHERE id = $1`,
      [tenantId],
    );
    const targetStatus = current.subscription_status === 'canceled' ? 'active' : 'canceled';

    // Click the button whose text matches the target status but is NOT disabled
    // (disabled = already selected). Use a locator that matches text strictly.
    const buttons = statusPanel.getByRole('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = await btn.textContent();
      const disabled = await btn.isDisabled();
      if (text?.trim().startsWith(targetStatus) && !disabled) {
        await btn.click();
        break;
      }
    }

    // Give the optimistic UI update and API call time to settle
    await page.waitForTimeout(3_000);

    const [row] = await dbQuery<{ subscription_status: string }>(
      `SELECT subscription_status FROM tenants WHERE id = $1`,
      [tenantId],
    );
    expect(row.subscription_status).toBe(targetStatus);
  });

  test('non-existent tenant id → redirected or shows 404', async ({ page }) => {
    await adminLogin(page);
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await page.goto(`/admin/tenants/${fakeId}`);
    // Either a 404 status or a Next.js not-found page rendered with 200
    const status = res?.status() ?? 0;
    const body = await page.content();
    const isNotFound =
      status === 404 ||
      body.toLowerCase().includes('not found') ||
      body.toLowerCase().includes('no encontrado') ||
      body.toLowerCase().includes('404');
    expect(isNotFound).toBe(true);
  });
});
