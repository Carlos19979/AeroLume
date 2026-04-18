/**
 * auth/signup-clones-catalog.spec.ts
 *
 * Covers §4.3 of docs/testing.md: verifies that the signup flow creates a
 * tenant and clones the base catalog (23 products, 115 pricing tiers, with
 * non-empty features) for the newly created user.
 *
 * Strategy
 * --------
 * The signup UI hits `supabase.auth.signUp` which sends a confirmation email
 * and does NOT immediately exchange a session (so /auth/callback is not
 * hit from the UI in this path). To keep the test deterministic we:
 *
 *   1. Submit the signup form through the UI (exercises real form, real
 *      validation, real supabase client call from the browser).
 *   2. Use the Supabase admin API to force-confirm the new user's email —
 *      this simulates the user clicking the email link without relying on
 *      an SMTP round-trip.
 *   3. Log in through the UI with the same credentials. `getAuthenticatedTenant`
 *      in `@/lib/auth-page` will auto-provision the tenant in NODE_ENV=development
 *      by calling `createTenantForUser` — which in turn calls
 *      `cloneBaseCatalogToTenant`.
 *   4. Navigate to `/dashboard/products` and assert the catalog shape:
 *      23 rows (data-testid="product-row-*"), 23 products in DB, 115
 *      pricing tiers (23 × 5), and at least one product with non-empty
 *      features.
 *
 * Cleanup: the `tenant_members` link is looked up to find the provisioned
 * tenant id; the tenant row is deleted (cascades to products, pricing
 * tiers, api keys, tenant_members), then the auth user is deleted.
 */

import { test, expect, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { dbQuery } from '../fixtures/api';
import postgres from 'postgres';

const TEST_PASSWORD = 'TestPassword123!';

function getServiceClient(): SupabaseClient {
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_KEY not set');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function cleanupTenant(tenantId: string): Promise<void> {
  const url = process.env.E2E_DATABASE_URL;
  if (!url) return;
  const sql = postgres(url, { max: 1, idle_timeout: 2 });
  try {
    await sql`DELETE FROM tenants WHERE id = ${tenantId}::uuid`;
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}

async function fillSignupForm(
  page: Page,
  opts: { name: string; company: string; email: string; password: string },
) {
  await page.goto('/signup');
  await page.locator('#signup-name').fill(opts.name);
  await page.locator('#signup-company').fill(opts.company);
  await page.locator('#signup-email').fill(opts.email);
  await page.locator('#signup-password').fill(opts.password);
  await page.getByRole('button', { name: /crear cuenta/i }).click();
}

test.describe('auth: signup clones catalog', () => {
  test('new signup -> confirm -> login -> tenant provisioned with 23 cloned products + 115 tiers', async ({
    page,
    browser,
  }, testInfo) => {
    const uniq = `${testInfo.workerIndex}-${Date.now()}`;
    const email = `e2e-signup-${uniq}@aerolume.test`;
    const companyName = `E2E Signup Co ${uniq}`;

    const supabase = getServiceClient();

    let userId: string | null = null;
    let tenantId: string | null = null;

    try {
      // -------------------------------------------------------------------
      // 1) Submit signup form through the UI.
      // -------------------------------------------------------------------
      await fillSignupForm(page, {
        name: 'E2E Signup User',
        company: companyName,
        email,
        password: TEST_PASSWORD,
      });

      // "Revisa tu email" panel should appear on success.
      await expect(page.getByText('Revisa tu email')).toBeVisible({ timeout: 15_000 });

      // -------------------------------------------------------------------
      // 2) Resolve the new user's id and force-confirm email via admin API.
      //    The signup may already have confirmed it in dev mode — we
      //    confirm idempotently.
      // -------------------------------------------------------------------
      // Supabase admin listUsers supports pagination. We find ours by email.
      let foundId: string | null = null;
      for (let pageNum = 1; pageNum <= 20 && !foundId; pageNum++) {
        const { data, error } = await supabase.auth.admin.listUsers({
          page: pageNum,
          perPage: 200,
        });
        if (error) break;
        const match = data.users.find((u) => u.email === email);
        if (match) foundId = match.id;
        if (data.users.length < 200) break;
      }
      if (!foundId) {
        throw new Error(`Unable to locate newly-created user ${email} via admin API.`);
      }
      userId = foundId;

      const { error: confirmErr } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
      if (confirmErr && !/confirmed/i.test(confirmErr.message)) {
        throw new Error(`Failed to confirm test user: ${confirmErr.message}`);
      }

      // -------------------------------------------------------------------
      // 3) Log in via UI. In dev mode, /dashboard server page calls
      //    getAuthenticatedTenant() which auto-provisions the tenant
      //    (cloning the base catalog) if none exists.
      // -------------------------------------------------------------------
      // Use a clean browser context so no residual session interferes.
      const context = await browser.newContext();
      const loginPage = await context.newPage();
      await loginPage.goto('/login');
      await loginPage.locator('#email').fill(email);
      await loginPage.locator('#password').fill(TEST_PASSWORD);
      await loginPage.getByRole('button', { name: /iniciar sesi(ó|o)n|entrar|acceder|log in/i }).click();

      // Dashboard should load for authenticated user (redirect or push).
      await loginPage.waitForURL(/\/dashboard(\/|$)/, { timeout: 20_000 });

      // -------------------------------------------------------------------
      // 4a) Assert /dashboard/products renders 23 rows.
      // -------------------------------------------------------------------
      await loginPage.goto('/dashboard/products');
      const rowLocator = loginPage.locator('[data-testid^="product-row-"]');
      await expect(rowLocator.first()).toBeVisible({ timeout: 20_000 });
      await expect(rowLocator).toHaveCount(23);

      // -------------------------------------------------------------------
      // 4b/c/d) Direct DB asserts.
      // -------------------------------------------------------------------
      // Resolve tenant id via membership → user.
      const memberships = await dbQuery<{ tenant_id: string }>(
        `SELECT tenant_id FROM tenant_members WHERE user_id = $1::uuid LIMIT 1`,
        [userId],
      );
      expect(memberships.length).toBe(1);
      tenantId = memberships[0].tenant_id;

      // (b) products count = 23
      const [{ count: productCount }] = await dbQuery<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM products WHERE tenant_id = $1::uuid`,
        [tenantId],
      );
      expect(parseInt(productCount, 10)).toBe(23);

      // (c) pricing tiers count = 23 × 5 = 115
      const [{ count: tierCount }] = await dbQuery<{ count: string }>(
        `SELECT COUNT(*)::text AS count
           FROM product_pricing_tiers
          WHERE product_id IN (SELECT id FROM products WHERE tenant_id = $1::uuid)`,
        [tenantId],
      );
      expect(parseInt(tierCount, 10)).toBe(115);

      // (d) at least one product with non-empty features array.
      const [{ count: featuresCount }] = await dbQuery<{ count: string }>(
        `SELECT COUNT(*)::text AS count
           FROM products
          WHERE tenant_id = $1::uuid
            AND features IS NOT NULL
            AND cardinality(features) > 0`,
        [tenantId],
      );
      expect(parseInt(featuresCount, 10)).toBeGreaterThan(0);

      await context.close();
    } finally {
      // -------------------------------------------------------------------
      // Cleanup — delete tenant (cascade) and auth user.
      // -------------------------------------------------------------------
      if (tenantId) {
        await cleanupTenant(tenantId).catch(() => undefined);
      }
      if (userId) {
        await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
      }
    }
  });
});
