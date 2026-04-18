/**
 * Sprint 2 – settings-update.spec.ts
 *
 * Verifies /dashboard/settings mutations:
 *   • Changing locale + currency persists to DB.
 *   • webhookUrl = http://127.0.0.1 is rejected (isInternalUrl guard → 400).
 *   • Page repopulates saved values after reload.
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

/** Click the save button and wait for the /api/internal/settings PUT to complete */
async function saveSettings(page: Page) {
  const saveWrapper = page.getByTestId(CRUD.settings.saveWrapper);
  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/internal/settings') && r.request().method() === 'PUT',
      { timeout: 10_000 },
    ),
    saveWrapper.getByRole('button').click(),
  ]);
  return response;
}

test.afterAll(async () => {
  await closeDbQuery();
});

test.describe('dashboard: settings update', () => {
  test('saves locale and currency to DB', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/settings');

    await page.getByTestId(CRUD.settings.locale).selectOption('en');
    await page.getByTestId(CRUD.settings.currency).selectOption('USD');

    const response = await saveSettings(page);
    expect(response.status()).toBe(200);

    // DB should have the new values
    const [row] = await dbQuery<{ locale: string; currency: string }>(
      `SELECT locale, currency FROM tenants WHERE id = $1`,
      [tenant.tenantId],
    );
    expect(row.locale).toBe('en');
    expect(row.currency).toBe('USD');
  });

  test('page repopulates saved locale and currency after reload', async ({ page, tenant }) => {
    // Pre-set values
    await dbQuery(
      `UPDATE tenants SET locale = $1, currency = $2 WHERE id = $3`,
      ['fr', 'GBP', tenant.tenantId],
    );

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/settings');

    await expect(page.getByTestId(CRUD.settings.locale)).toHaveValue('fr');
    await expect(page.getByTestId(CRUD.settings.currency)).toHaveValue('GBP');
  });

  test('webhookUrl = http://127.0.0.1 is blocked by server (400 / error shown)', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/settings');

    const webhookInput = page.getByTestId(CRUD.settings.webhookUrl);
    await webhookInput.fill('http://127.0.0.1');

    const response = await saveSettings(page);

    // Server returns 400 via isInternalUrl guard
    expect(response.status()).toBe(400);

    // UI shows the error banner
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5_000 });

    // DB webhook_url must NOT be http://127.0.0.1
    const [row] = await dbQuery<{ webhook_url: string | null }>(
      `SELECT webhook_url FROM tenants WHERE id = $1`,
      [tenant.tenantId],
    );
    expect(row.webhook_url).not.toBe('http://127.0.0.1');
  });

  test('valid webhookUrl saves to DB', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/settings');

    const webhookUrl = 'https://example.com/webhook';
    await page.getByTestId(CRUD.settings.webhookUrl).fill(webhookUrl);

    const response = await saveSettings(page);
    expect(response.status()).toBe(200);

    const [row] = await dbQuery<{ webhook_url: string }>(
      `SELECT webhook_url FROM tenants WHERE id = $1`,
      [tenant.tenantId],
    );
    expect(row.webhook_url).toBe(webhookUrl);
  });
});
