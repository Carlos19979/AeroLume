import { test, expect } from '@playwright/test';

// Nav links from Navigation.tsx:
// Configurador → /#configurador, Como funciona → /#como-funciona,
// Nosotros → /about, Contacto → /contact
// Auth CTAs: Acceder → /login, Registrate → /signup

test.describe('marketing: navigation', () => {
  test('"Nosotros" nav link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /nosotros/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('"Contacto" nav link navigates to /contact', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /contacto/i }).first().click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('"Acceder" nav CTA navigates to /login', async ({ page }) => {
    await page.goto('/about');
    // On non-home pages nav is always light (white background)
    await page.getByRole('link', { name: /acceder/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('"Registrate" nav CTA navigates to /signup', async ({ page }) => {
    await page.goto('/about');
    // Multiple "Registrate" links may exist (desktop + mobile); use first visible
    await page.getByRole('link', { name: /registrate/i }).first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('"Configurador" nav link stays on / with hash', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: /configurador/i }).first().click();
    await expect(page).toHaveURL(/\/#?configurador/);
  });

  test('logo link returns to /', async ({ page }) => {
    await page.goto('/about');
    // Logo is inside a Link href="/"
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/\//);
    await expect(page.locator('h1')).toBeVisible();
  });
});
