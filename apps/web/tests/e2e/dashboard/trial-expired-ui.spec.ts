/**
 * Trial-expired UI tests.
 *
 * beforeEach sets trial_ends_at to yesterday via SQL, then navigates to
 * /dashboard/settings to assert the expired state UI.
 */
import { test, expect } from '../fixtures/auth';
import { dbQuery, closeDbQuery } from '../fixtures/api';
import { TID } from '../fixtures/selectors';
import type { Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/i }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

test.afterAll(async () => {
  await closeDbQuery();
});

test.describe('dashboard: trial expired UI', () => {
  test.beforeEach(async ({ tenant }) => {
    await dbQuery(
      `UPDATE tenants
       SET trial_ends_at = NOW() - INTERVAL '1 day'
       WHERE id = $1`,
      [tenant.tenantId],
    );
  });

  test('subscription page shows trial-expired inline warning', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/settings');

    // The inline warning inside the hero card
    await expect(
      page.getByText(/prueba ha expirado/i).first(),
    ).toBeVisible();
  });

  test('upgrade CTA is still present when trial is expired', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/settings');

    await expect(page.getByTestId(TID.dashboard.upgradeCta)).toBeVisible();
  });

  test('global dashboard layout shows trial-expired banner', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    // Navigate to any dashboard page — the banner lives in the layout
    await page.goto('/dashboard/products');

    const banner = page.getByTestId(TID.dashboard.trialExpiredBanner);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/expirado/i);
  });
});
