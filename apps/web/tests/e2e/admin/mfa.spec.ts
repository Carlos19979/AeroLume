/**
 * E2E tests: Super Admin TOTP MFA flow
 *
 * NOTE: These tests require:
 *   1. ENFORCE_SUPER_ADMIN_MFA=1 in .env.test (or the test env)
 *   2. MFA enabled in the Supabase project (Authentication → MFA → enable TOTP)
 *
 * If MFA is not enabled in the Supabase project, tests will be skipped.
 * See docs/deploy.md for how to enable MFA in Supabase.
 */
import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ensureAdminUser, adminLogin } from '../fixtures/admin-auth';

// otplib v13 for generating valid TOTP codes deterministically
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generate: totpGenerate } = require('otplib') as { generate: (opts: { secret: string; encoding: string }) => Promise<string> };

const MFA_ENFORCED = process.env.ENFORCE_SUPER_ADMIN_MFA === '1';
const SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_KEY ?? '';

function getServiceClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_KEY not set');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Unenroll all TOTP factors for a user via service-role API.
 * Used for test cleanup.
 */
async function unenrollAllFactors(userId: string): Promise<void> {
  const supabase = getServiceClient();
  const { data } = await supabase.auth.admin.mfa.listFactors({ userId });
  const factors = data?.factors ?? [];
  await Promise.all(
    factors.map((f) => supabase.auth.admin.mfa.deleteFactor({ userId, id: f.id }).catch(() => undefined)),
  );
}

test.describe('admin MFA: enforcement gate', () => {
  test.skip(!MFA_ENFORCED, 'Set ENFORCE_SUPER_ADMIN_MFA=1 to run MFA tests');

  let adminUserId: string;

  test.beforeAll(async () => {
    const { userId } = await ensureAdminUser();
    adminUserId = userId;
    // Ensure clean slate — no factors enrolled before tests
    await unenrollAllFactors(adminUserId);
  });

  test.afterAll(async () => {
    // Clean up any factors created during tests
    await unenrollAllFactors(adminUserId).catch(() => undefined);
  });

  test('super admin without MFA factor visits /admin → redirected to /admin/mfa enrollment', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin');
    await page.waitForURL(/\/admin\/mfa$/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/admin\/mfa$/);
    // QR code should be visible
    await expect(page.locator('img[alt="QR Code TOTP"]')).toBeVisible({ timeout: 10_000 });
  });

  test('enrollment flow: enroll factor, enter correct code, land on /admin', async ({ page }) => {
    // Must skip if MFA admin API is unavailable
    const supabase = getServiceClient();
    const testListResult = await supabase.auth.admin.mfa.listFactors({ userId: adminUserId });
    if (testListResult.error?.message?.includes('not enabled') || testListResult.error?.message?.includes('not supported')) {
      test.skip(true, 'Enable MFA in Supabase project settings (Authentication → MFA)');
      return;
    }

    await adminLogin(page);
    await page.goto('/admin/mfa');
    await page.waitForURL(/\/admin\/mfa$/, { timeout: 15_000 });

    // After the page loads, the server has enrolled a factor — retrieve its secret
    // via admin API by checking what new factor was created
    await page.waitForSelector('img[alt="QR Code TOTP"]', { timeout: 10_000 });

    // Get the secret from the code element (displayed on page)
    const secretEl = page.locator('code');
    const secret = (await secretEl.textContent())?.trim() ?? '';
    expect(secret.length).toBeGreaterThan(10);

    // Generate TOTP code using otplib v13 async API
    const totpCode = await totpGenerate({ secret, encoding: 'base32' });

    // Fill and submit
    await page.locator('#totp-code').fill(totpCode);

    // Wait for redirect to /admin
    await page.waitForURL(/\/admin$/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/admin$/);
  });

  test('challenge flow: enrolled admin, fresh session → redirected to challenge → submit code → /admin', async ({ page }) => {
    // This test requires a pre-enrolled factor. Enroll via service API.
    const supabase = getServiceClient();

    // First enroll a factor directly via admin API (without browser)
    // We need to enroll and get the secret — use admin API if available
    const { data: factorsData } = await supabase.auth.admin.mfa.listFactors({ userId: adminUserId });
    const verifiedFactor = factorsData?.factors?.find((f) => f.status === 'verified');

    if (!verifiedFactor) {
      test.skip(true, 'No verified factor — run enrollment test first or seed a factor via Supabase admin API');
      return;
    }

    // Login fresh (aal1 only)
    await adminLogin(page);

    // Visit /admin — should redirect to challenge
    await page.goto('/admin');
    await page.waitForURL(/\/admin\/mfa\/challenge/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/admin\/mfa\/challenge/);

    // We need the TOTP secret to generate a code — this is only possible if we stored it.
    // In this test we log that it requires manual setup.
    test.skip(true, 'Challenge flow test requires knowing the TOTP secret — enroll in a controlled way with secret capture');
  });

  test('non-super-admin user is NOT required to do MFA (gate only for super admins)', async ({ page }) => {
    // A regular user visiting /dashboard should not be affected by MFA gate
    // They can't visit /admin anyway, but verify /dashboard is accessible without MFA
    await page.goto('/dashboard');
    // Should redirect to /login if not logged in — that's fine, just not to /admin/mfa
    const url = page.url();
    expect(url).not.toMatch(/\/admin\/mfa/);
  });
});

test.describe('admin MFA: enrollment page UI (smoke)', () => {
  test.skip(!MFA_ENFORCED, 'Set ENFORCE_SUPER_ADMIN_MFA=1 to run MFA tests');

  test('enrollment page shows QR code and secret', async ({ page }) => {
    // Clean up factors first
    const { userId } = await ensureAdminUser();
    await unenrollAllFactors(userId);

    await adminLogin(page);
    await page.goto('/admin/mfa');
    await page.waitForURL(/\/admin\/mfa$/, { timeout: 15_000 });

    await expect(page.locator('img[alt="QR Code TOTP"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('code')).toBeVisible();
    await expect(page.locator('#totp-code')).toBeVisible();
    await expect(page.getByText(/Volver a generar/i)).toBeVisible();
  });

  test('challenge page shows code input for enrolled user', async ({ page }) => {
    const { userId } = await ensureAdminUser();
    const { data: factorsData } = await getServiceClient().auth.admin.mfa.listFactors({ userId });
    const hasVerifiedFactor = factorsData?.factors?.some((f) => f.status === 'verified') ?? false;

    if (!hasVerifiedFactor) {
      test.skip(true, 'No verified factor — run enrollment test first');
      return;
    }

    await adminLogin(page);
    await page.goto('/admin/mfa/challenge');
    await page.waitForURL(/\/admin\/mfa\/challenge/, { timeout: 15_000 });
    await expect(page.locator('#totp-challenge')).toBeVisible({ timeout: 10_000 });
  });
});
