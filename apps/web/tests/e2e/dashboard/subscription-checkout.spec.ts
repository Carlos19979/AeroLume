/**
 * Subscription checkout flow tests.
 *
 * The tenant fixture is in plan='prueba' with an active trial by default.
 * Checkout is intercepted via page.route — never calls LemonSqueezy for real.
 */
import { test, expect } from '../fixtures/auth';
import { closeDbQuery } from '../fixtures/api';
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

test.describe('dashboard: subscription checkout', () => {
  test('trial state: plan badge shows "Prueba", trial days > 0, upgrade CTA exists, portal CTA absent', async ({
    page,
    tenant,
  }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/subscription');

    // Plan badge
    const badge = page.getByTestId(TID.dashboard.planBadge);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Prueba');

    // Trial days left > 0
    const countdown = page.getByTestId(TID.dashboard.trialCountdown);
    await expect(countdown).toBeVisible();
    const daysText = await countdown.textContent();
    const days = parseInt(daysText ?? '0', 10);
    expect(days).toBeGreaterThan(0);

    // Upgrade CTA present
    await expect(page.getByTestId(TID.dashboard.upgradeCta)).toBeVisible();

    // Portal CTA absent (no subscription yet)
    await expect(page.getByTestId(TID.dashboard.portalCta)).not.toBeVisible();
  });

  test('clicking upgrade CTA calls /api/internal/checkout and redirects to returned URL', async ({
    page,
    tenant,
  }) => {
    const FAKE_CHECKOUT_URL = 'https://example.com/fake-lemon-checkout';

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/subscription');

    // Intercept the checkout API call
    await page.route('**/api/internal/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: FAKE_CHECKOUT_URL }),
      });
    });

    // Also intercept the subsequent navigation to the fake URL so DNS never fires
    await page.route(FAKE_CHECKOUT_URL, async (route) => {
      await route.fulfill({ status: 200, body: '<html><body>fake checkout</body></html>' });
    });

    // Click upgrade — the client does window.location.href = data.url
    const upgradeBtn = page.getByTestId(TID.dashboard.upgradeCta);
    await expect(upgradeBtn).toBeVisible();

    await upgradeBtn.click();
    await page.waitForURL(FAKE_CHECKOUT_URL, { timeout: 10_000 });

    expect(page.url()).toBe(FAKE_CHECKOUT_URL);
  });
});
