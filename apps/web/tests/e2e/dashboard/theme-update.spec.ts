/**
 * Sprint 2 – theme-update.spec.ts
 *
 * Verifies the /dashboard/theme page:
 *   • Updating the primary accent colour persists to DB.
 *   • Reloading the page repopulates the saved value.
 */
import { test, expect } from '../fixtures/auth';
import { dbQuery, closeDbQuery } from '../fixtures/api';
import { CRUD } from '../fixtures/selectors';
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

test.describe('dashboard: theme update', () => {
  test('saves primary accent colour to DB', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/theme');

    const newColor = '#ff3300';

    // The accent hex text input inside the "theme-accent-picker" wrapper
    const accentInput = page.getByTestId(CRUD.theme.accentHex);
    await expect(accentInput).toBeVisible();

    await accentInput.fill(newColor);
    await accentInput.blur();

    // Click Save inside the theme-save wrapper
    const saveWrapper = page.getByTestId(CRUD.theme.saveWrapper);
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/internal/theme') && r.request().method() === 'PUT',
        { timeout: 10_000 },
      ),
      saveWrapper.getByRole('button').click(),
    ]);
    expect(response.status()).toBe(200);

    // Assert DB updated
    const [row] = await dbQuery<{ theme_accent: string }>(
      `SELECT theme_accent FROM tenants WHERE id = $1`,
      [tenant.tenantId],
    );
    expect(row.theme_accent).toBe(newColor);
  });

  test('page repopulates saved accent colour after reload', async ({ page, tenant }) => {
    const savedColor = '#00aaff';

    // Pre-set via DB directly so the test is independent
    await dbQuery(
      `UPDATE tenants SET theme_accent = $1 WHERE id = $2`,
      [savedColor, tenant.tenantId],
    );

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/theme');

    const accentInput = page.getByTestId(CRUD.theme.accentHex);
    await expect(accentInput).toBeVisible();
    await expect(accentInput).toHaveValue(savedColor);
  });
});
