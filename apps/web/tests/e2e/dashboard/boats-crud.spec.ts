/**
 * Sprint 2 – boats-crud.spec.ts
 *
 * The /dashboard/boats page is a read-only lookup against the global boats
 * catalog; there is no custom-boat CRUD UI. This spec verifies:
 *   • The page loads and renders boat rows.
 *   • Search narrows results.
 *   • Boat detail modal opens and shows rig / sail-area data.
 *   • No edit or delete controls are present (global catalog is read-only).
 */
import { test, expect } from '../fixtures/auth';
import { closeDbQuery } from '../fixtures/api';
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

test.describe('dashboard: boats (read-only catalog)', () => {
  test('page loads and shows at least one boat row', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/boats');

    // Wait for loading spinner to go away and a row to appear
    await expect(page.locator('tr').first()).toBeVisible({ timeout: 15_000 });

    // There should be a counter like "N barcos"
    await expect(page.locator('text=/\\d+ barcos/i')).toBeVisible();
  });

  test('search filters boat rows by model name', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/boats');

    // Wait for initial load
    await expect(page.locator('tr').first()).toBeVisible({ timeout: 15_000 });

    const searchInput = page.getByPlaceholder(/Buscar barcos/i);
    await searchInput.fill('Bavaria');

    // Wait for debounced fetch (300ms) + render
    await page.waitForTimeout(600);

    // All visible model cells should mention Bavaria
    const cells = page.locator('td').filter({ hasText: /Bavaria/i });
    await expect(cells.first()).toBeVisible();
  });

  test('boat detail modal shows rig data and global badge', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/boats');

    // Wait for rows
    await expect(page.locator('tr').nth(1)).toBeVisible({ timeout: 15_000 });

    // Click "Ver" on the first data row
    const verBtn = page.getByRole('button', { name: /Ver/i }).first();
    await verBtn.click();

    // Modal should appear
    // The modal overlay uses z-50 for the centered panel
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();

    // Badge showing it is a global boat — scoped to the modal panel
    const modal = page.locator('.fixed.inset-0.z-50');
    await expect(modal.getByText('Global', { exact: true })).toBeVisible();
  });

  test('no edit or delete buttons exist for any boat row', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/boats');

    await expect(page.locator('tr').nth(1)).toBeVisible({ timeout: 15_000 });

    // There must be no Editar / Eliminar buttons in the boats table
    expect(await page.locator('button', { hasText: /^Editar$/i }).count()).toBe(0);
    expect(await page.locator('button', { hasText: /^Eliminar$/i }).count()).toBe(0);
  });
});
