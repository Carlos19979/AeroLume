/**
 * Spec 2: Products list page shows 23 cloned products.
 *
 * Verifies that a fresh tenant has the full catalog (23 products) rendered in
 * the dashboard /dashboard/products table, and specific expected rows exist.
 */
import { test, expect } from '../fixtures/auth';
import type { Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/ }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

test.describe('dashboard: products list', () => {
  test('renders exactly 23 products from the cloned catalog', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/products');

    // Wait until the product table finishes rendering (rows are keyed by id).
    const rows = page.locator('tr[data-testid^="product-row-"]');
    await expect(rows.first()).toBeVisible();
    await expect(rows).toHaveCount(23);

    // Specific variants expected from the base catalog.
    await expect(
      page.getByRole('button', { name: 'Mayor Clásica — Cruising Racing' }),
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Mayor Full Batten — Cruising', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Mayor Full Batten — Cruising Plus' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Mayor Full Batten — Cruising Racing' }),
    ).toBeVisible();
  });
});
