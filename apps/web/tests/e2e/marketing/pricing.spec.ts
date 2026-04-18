/**
 * Pricing page smoke + navigation tests.
 * Public page — no auth fixture needed.
 */
import { test, expect } from '@playwright/test';

test.describe('marketing: pricing page', () => {
  test('GET /pricing returns 200 and hero heading is visible', async ({ page }) => {
    const res = await page.goto('/pricing');
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId('pricing-hero-heading')).toBeVisible();
  });

  test('both tier cards render', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByTestId('pricing-tier-trial')).toBeVisible();
    await expect(page.getByTestId('pricing-tier-pro')).toBeVisible();
  });

  test('Pro card shows "Recomendado" badge', async ({ page }) => {
    await page.goto('/pricing');
    const proBadge = page.getByTestId('pricing-tier-pro').getByText(/recomendado/i);
    await expect(proBadge).toBeVisible();
  });

  test('Trial CTA navigates to /signup', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByTestId('pricing-cta-trial').click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('Pro CTA navigates to /signup', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByTestId('pricing-cta-pro').click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('"Precios" nav link appears in header and navigates to /pricing', async ({ page }) => {
    await page.goto('/');
    const navLink = page.getByTestId('pricing-nav-link').first();
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('responsive: both tiers visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pricing');
    await expect(page.getByTestId('pricing-tier-trial')).toBeVisible();
    await expect(page.getByTestId('pricing-tier-pro')).toBeVisible();
  });
});
