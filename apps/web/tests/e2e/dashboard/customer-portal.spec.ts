/**
 * Customer portal CTA tests.
 *
 * beforeEach upgrades the tenant to Pro (plan='pro', status='active',
 * ls_customer_id set) via direct DB update, then reloads the subscription page.
 * Portal calls are intercepted — never calls LemonSqueezy for real.
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

test.describe('dashboard: customer portal', () => {
  test('portal CTA is visible for active Pro tenant with lsCustomerId', async ({
    page,
    tenant,
  }) => {
    // Simulate active Pro subscription in DB
    await dbQuery(
      `UPDATE tenants
       SET plan = 'pro',
           subscription_status = 'active',
           ls_customer_id = 'cus_123',
           ls_subscription_id = 'sub_456'
       WHERE id = $1`,
      [tenant.tenantId],
    );

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/subscription');

    // Portal CTA must be visible
    await expect(page.getByTestId(TID.dashboard.portalCta)).toBeVisible();
  });

  test('clicking portal CTA calls /api/internal/customer-portal and redirects', async ({
    page,
    tenant,
  }) => {
    const FAKE_PORTAL_URL = 'https://example.com/fake-portal';

    // Simulate active Pro subscription
    await dbQuery(
      `UPDATE tenants
       SET plan = 'pro',
           subscription_status = 'active',
           ls_customer_id = 'cus_123',
           ls_subscription_id = 'sub_456'
       WHERE id = $1`,
      [tenant.tenantId],
    );

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/subscription');

    // Intercept the customer portal API call
    await page.route('**/api/internal/customer-portal', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: FAKE_PORTAL_URL }),
      });
    });

    // Also intercept the subsequent navigation so DNS never fires
    await page.route(FAKE_PORTAL_URL, async (route) => {
      await route.fulfill({ status: 200, body: '<html><body>fake portal</body></html>' });
    });

    const portalBtn = page.getByTestId(TID.dashboard.portalCta);
    await expect(portalBtn).toBeVisible();

    await portalBtn.click();
    await page.waitForURL(FAKE_PORTAL_URL, { timeout: 10_000 });

    expect(page.url()).toBe(FAKE_PORTAL_URL);
  });

  test('portal CTA is not visible when lsCustomerId is null', async ({
    page,
    tenant,
  }) => {
    // Pro plan but no ls_customer_id — portal button should not render
    await dbQuery(
      `UPDATE tenants
       SET plan = 'pro',
           subscription_status = 'active',
           ls_customer_id = NULL,
           ls_subscription_id = 'sub_456'
       WHERE id = $1`,
      [tenant.tenantId],
    );

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/subscription');

    // Button must not be in the DOM (lsCustomerId is null → component doesn't render it)
    await expect(page.getByTestId(TID.dashboard.portalCta)).not.toBeVisible();
  });
});
