/**
 * dashboard: theme template selector + per-step copy overrides
 *
 * Covers the features added when multi-template support landed:
 *   • Clicking a template preset applies its palette locally
 *   • Saving persists theme_template + theme_copy to the DB
 *   • Per-step copy fields (title/subtitle) save and reload
 *   • The Logo input is no longer rendered
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

async function saveTheme(page: Page) {
  const saveWrapper = page.getByTestId(CRUD.theme.saveWrapper);
  await saveWrapper.scrollIntoViewIfNeeded();
  const saveBtn = saveWrapper.getByRole('button');
  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/internal/theme') && r.request().method() === 'PUT',
      { timeout: 15_000 },
    ),
    saveBtn.click(),
  ]);
  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(`PUT /api/internal/theme returned ${response.status()}: ${body}`);
  }
}

test.afterAll(async () => {
  await closeDbQuery();
});

test.describe('dashboard: theme templates', () => {
  test('selecting Editorial applies its accent preset + persists theme_template', async ({
    page,
    tenant,
  }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/theme');

    // Click Editorial template card
    await page.getByTestId(CRUD.theme.template('editorial')).click();

    // The accent hex input flips to Editorial's signal red (#c4452d)
    const accentInput = page.getByTestId(CRUD.theme.accentHex);
    await expect(accentInput).toHaveValue('#c4452d');

    await saveTheme(page);

    // DB reflects the new template and preset
    const [row] = await dbQuery<{ theme_template: string; theme_accent: string }>(
      'SELECT theme_template, theme_accent FROM tenants WHERE id = $1',
      [tenant.tenantId],
    );
    expect(row.theme_template).toBe('editorial');
    expect(row.theme_accent).toBe('#c4452d');
  });

  test('step copy overrides persist to theme_copy JSONB', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/theme');

    const customTitle = 'Bienvenido a bordo';
    const customSubtitle = 'Elige tu barco para empezar.';

    const titleInput = page.getByTestId(CRUD.theme.copyTitle('boat'));
    const subtitleInput = page.getByTestId(CRUD.theme.copySubtitle('boat'));

    await expect(titleInput).toBeVisible();
    await titleInput.fill(customTitle);
    await subtitleInput.fill(customSubtitle);

    await saveTheme(page);

    // Read theme_copy JSONB from DB and assert the boat overrides are there
    const [row] = await dbQuery<{ theme_copy: { boat?: { title?: string; subtitle?: string } } }>(
      'SELECT theme_copy FROM tenants WHERE id = $1',
      [tenant.tenantId],
    );
    expect(row.theme_copy?.boat?.title).toBe(customTitle);
    expect(row.theme_copy?.boat?.subtitle).toBe(customSubtitle);
  });

  test('switching templates refreshes the step copy defaults in the editor', async ({
    page,
    tenant,
  }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/theme');

    // Click Premium → its boat title default should load
    await page.getByTestId(CRUD.theme.template('premium')).click();
    const titleInput = page.getByTestId(CRUD.theme.copyTitle('boat'));
    await expect(titleInput).toHaveValue('Identifica tu embarcación');

    // Click Marine → different default
    await page.getByTestId(CRUD.theme.template('marine')).click();
    await expect(titleInput).toHaveValue('¿Qué barco tienes?');
  });

  test('the legacy logo URL input is no longer rendered', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/theme');

    // Logo section was removed. There should be no input with the old placeholder.
    const logoInput = page.locator('input[placeholder="https://tu-web.com/logo.svg"]');
    await expect(logoInput).toHaveCount(0);
  });
});
