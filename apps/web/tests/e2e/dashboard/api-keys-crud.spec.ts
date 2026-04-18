/**
 * Sprint 2 – api-keys-crud.spec.ts
 *
 * Verifies /dashboard/api-keys mutations:
 *   • Create: secret shown once in the banner; DB stores only the hashed prefix.
 *   • Revoke: key deleted from DB; subsequent API call returns 401.
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery, closeDbQuery } from '../fixtures/api';
import { CRUD } from '../fixtures/selectors';
import type { Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

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

test.describe('dashboard: API keys CRUD', () => {
  test('create – raw secret shown once in banner, DB stores only prefix+hash', async ({ page, tenant }) => {
    // The tenant fixture already has one key – revoke it so the "create" form becomes visible
    // (the UI only shows the create button when keys.length === 0).
    // We revoke via the page to keep the test realistic.
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/api-keys');

    // Revoke the existing key first
    const revokeBtn = page.locator('[data-testid^="apikey-revoke-"]').first();
    if (await revokeBtn.isVisible()) {
      page.once('dialog', (d) => d.accept());
      await revokeBtn.click();
      await expect(revokeBtn).not.toBeVisible({ timeout: 5_000 });
    }

    // Now the create button should be visible (keys.length === 0)
    await expect(page.getByTestId(CRUD.apiKey.createBtn)).toBeVisible({ timeout: 5_000 });
    await page.getByTestId(CRUD.apiKey.createBtn).click();

    // The create form appears
    const keyName = `CI Key ${Date.now()}`;
    const nameInput = page.getByPlaceholder('Nombre (ej: Producción, Staging...)');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(keyName);
    await page.getByRole('button', { name: 'Crear' }).click();

    // Raw key banner must appear
    const modal = page.getByTestId(CRUD.apiKey.rawModal);
    await expect(modal).toBeVisible({ timeout: 8_000 });

    const rawKeyText = await modal.locator('code').textContent();
    expect(rawKeyText).toBeTruthy();
    expect(rawKeyText!.startsWith('ak_')).toBe(true);

    // Extract prefix (first 8 chars after "ak_" — keyPrefix is stored as first N chars)
    const prefix = rawKeyText!.slice(0, 11); // "ak_" + 8 chars = 11

    // DB must have keyPrefix but NOT the raw secret
    const dbRows = await dbQuery<{ key_prefix: string; key_hash: string; name: string }>(
      `SELECT key_prefix, key_hash, name FROM api_keys WHERE tenant_id = $1 AND name = $2`,
      [tenant.tenantId, keyName],
    );
    expect(dbRows).toHaveLength(1);
    // keyPrefix should match start of the raw key
    expect(rawKeyText!.startsWith(dbRows[0].key_prefix)).toBe(true);
    // key_hash must NOT equal the raw key (it's hashed)
    expect(dbRows[0].key_hash).not.toBe(rawKeyText);

    // Dismiss banner and verify secret is gone
    await page.getByRole('button', { name: /Cerrar/i }).click();
    await expect(modal).not.toBeVisible();

    // Raw key no longer displayed anywhere on the page
    await expect(page.locator(`text=${rawKeyText}`)).not.toBeVisible();
  });

  test('revoke – key deleted from DB and returns 401 on API', async ({ page, tenant }) => {
    // Use the key provisioned by the auth fixture
    const apiKey = tenant.apiKey;

    // Verify it works first
    const client = apiClient(BASE_URL, apiKey);
    const before = await client.get('/api/v1/products');
    expect(before.status).toBe(200);

    // Revoke via dashboard
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/api-keys');

    const revokeBtn = page.locator('[data-testid^="apikey-revoke-"]').first();
    await expect(revokeBtn).toBeVisible();
    page.once('dialog', (d) => d.accept());
    await revokeBtn.click();

    // Row must disappear
    await expect(revokeBtn).not.toBeVisible({ timeout: 5_000 });

    // DB: no api_keys for this tenant
    const dbRows = await dbQuery<{ id: string }>(
      `SELECT id FROM api_keys WHERE tenant_id = $1`,
      [tenant.tenantId],
    );
    expect(dbRows).toHaveLength(0);

    // Revoked key returns 401
    const after = await client.get('/api/v1/products');
    expect(after.status).toBe(401);
  });
});
