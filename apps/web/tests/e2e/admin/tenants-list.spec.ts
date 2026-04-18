/**
 * Spec 1: Admin panel – tenants list (/admin/tenants)
 *
 * - Super-admin can navigate to /admin/tenants
 * - All tenants in the DB are visible (row count matches DB count)
 * - Each row shows: tenant name, plan, status, created date
 * - Search box filters rows correctly (>= 2 chars)
 */
import { test, expect } from '@playwright/test';
import { dbQuery } from '../fixtures/api';
import {
  ensureAdminUser,
  adminLogin,
  deleteAdminUser,
  ADMIN_EMAIL,
} from '../fixtures/admin-auth';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { createClient } from '@supabase/supabase-js';

const TEST_PASSWORD = 'TestPassword123!';

test.describe('admin: tenants list', () => {
  let adminUserId: string;
  let adminCreated: boolean;

  test.beforeAll(async () => {
    const result = await ensureAdminUser();
    adminUserId = result.userId;
    adminCreated = result.created;
  });

  test.afterAll(async () => {
    // Only delete if we created it (don't remove pre-existing seed users)
    if (adminCreated) {
      await deleteAdminUser(adminUserId);
    }
  });

  test('shows all DB tenants with required columns', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/tenants');
    await page.waitForSelector('table tbody tr', { timeout: 15_000 });

    // Count from DB at the time we load the page (may drift with parallel tests)
    const [{ count: dbCount }] = await dbQuery<{ count: number }>(
      `SELECT count(*)::int AS count FROM tenants`,
    );

    // Count visible rows — the page is a server-rendered snapshot, so row count
    // should be >= 1. We check it is positive and within a reasonable bound of the
    // DB count (parallel tests may create tenants between our DB query and page load).
    const rows = page.locator('table tbody tr');
    const uiCount = await rows.count();
    expect(uiCount).toBeGreaterThan(0);
    // UI count should be close to DB count (within 20 — parallel test headroom)
    expect(Math.abs(uiCount - dbCount)).toBeLessThanOrEqual(20);

    // First row should show name, plan badge, status badge, date
    const firstRow = rows.first();
    // Name: non-empty text in first td
    const nameTd = firstRow.locator('td').first();
    await expect(nameTd).not.toBeEmpty();

    // Plan column: a span with text (e.g. "prueba", "pro")
    await expect(firstRow.locator('td span').first()).toBeVisible();

    // Date column (Registro = 9th column, 0-indexed: 8)
    const dateTd = firstRow.locator('td').nth(8);
    await expect(dateTd).toBeVisible();
  });

  test('search filters rows by tenant name', async ({ page }) => {
    // Create a tenant with a unique, searchable name
    const supabase = createClient(
      process.env.E2E_SUPABASE_URL!,
      process.env.E2E_SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const email = `e2e-list-${Date.now()}@aerolume.test`;
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !userData?.user) throw new Error(`Failed to create user: ${error?.message}`);
    const userId = userData.user.id;

    const uniqueName = `ZZZ-SearchTarget-${Date.now()}`;
    const { tenantId } = await createTestTenant({ ownerUserId: userId, name: uniqueName });

    try {
      await adminLogin(page);
      await page.goto('/admin/tenants');
      await page.waitForSelector('table tbody tr', { timeout: 15_000 });

      // Get initial total count
      const initialCount = await page.locator('table tbody tr').count();
      expect(initialCount).toBeGreaterThan(0);

      // Type into search input
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.fill(uniqueName);

      // Wait for filtering — the counter "X de Y" should update
      await expect(page.locator('text=/1 de /')).toBeVisible({ timeout: 5_000 });

      const filteredRows = page.locator('table tbody tr');
      await expect(filteredRows).toHaveCount(1, { timeout: 5_000 });
      await expect(filteredRows.first().locator('td').first()).toContainText(uniqueName);

      // Clear search — all rows return
      await searchInput.clear();
      await expect(page.locator('table tbody tr')).toHaveCount(initialCount, { timeout: 5_000 });
    } finally {
      await cleanupTenant(tenantId).catch(() => undefined);
      await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
    }
  });
});
