/**
 * Spec 5: Trial gate blocks mutations but allows reads.
 *
 * When a tenant on plan='prueba' has trialEndsAt in the past, withTenantAuth
 * must:
 *   - allow all GETs (read-only endpoints)
 *   - block POST / PUT / DELETE with 403 "Trial expired"
 */
import { test, expect } from '../fixtures/auth';
import { expireTrial, extendTrial } from '../fixtures/tenant';
import { dbQuery } from '../fixtures/api';
import type { Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/ }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

test.describe('api internal: trial gate', () => {
  test('blocks POST/PUT/DELETE but allows GETs once trial has expired', async ({
    page,
    tenant,
  }) => {
    // Log in first so the route matrix sees a valid session.
    await loginAs(page, tenant.email, tenant.password);

    // Expire the trial.
    await expireTrial(tenant.tenantId);

    // Pick a product id owned by this tenant so PUT/DELETE have a real target.
    const rows = await dbQuery<{ id: string }>(
      `SELECT id FROM products WHERE tenant_id = $1 LIMIT 1`,
      [tenant.tenantId],
    );
    expect(rows.length).toBe(1);
    const productId = rows[0].id;

    try {
      // --- GET endpoints: expected 200 ---------------------------------
      const getProducts = await page.request.get('/api/internal/products');
      expect(getProducts.status()).toBe(200);

      const getApiKeys = await page.request.get('/api/internal/api-keys');
      expect(getApiKeys.status()).toBe(200);

      const getSettings = await page.request.get('/api/internal/settings');
      expect(getSettings.status()).toBe(200);

      // --- POST products: blocked --------------------------------------
      const postProducts = await page.request.post('/api/internal/products', {
        data: { name: 'X', sailType: 'gvstd' },
        headers: { 'content-type': 'application/json' },
      });
      expect(postProducts.status()).toBe(403);
      const postProductsBody = await postProducts.json().catch(() => ({}));
      expect(postProductsBody?.error).toMatch(/trial/i);

      // --- PUT product: blocked ----------------------------------------
      const putProduct = await page.request.put(`/api/internal/products/${productId}`, {
        data: { name: 'renamed' },
        headers: { 'content-type': 'application/json' },
      });
      expect(putProduct.status()).toBe(403);
      const putBody = await putProduct.json().catch(() => ({}));
      expect(putBody?.error).toMatch(/trial/i);

      // --- DELETE product: blocked -------------------------------------
      const delProduct = await page.request.delete(`/api/internal/products/${productId}`);
      expect(delProduct.status()).toBe(403);
      const delBody = await delProduct.json().catch(() => ({}));
      expect(delBody?.error).toMatch(/trial/i);

      // --- POST api-keys: blocked --------------------------------------
      const postKey = await page.request.post('/api/internal/api-keys', {
        data: { name: 'X' },
        headers: { 'content-type': 'application/json' },
      });
      expect(postKey.status()).toBe(403);
      const postKeyBody = await postKey.json().catch(() => ({}));
      expect(postKeyBody?.error).toMatch(/trial/i);

      // --- PUT settings: blocked ---------------------------------------
      const putSettings = await page.request.put('/api/internal/settings', {
        data: { name: 'Renamed Co' },
        headers: { 'content-type': 'application/json' },
      });
      expect(putSettings.status()).toBe(403);
      const putSettingsBody = await putSettings.json().catch(() => ({}));
      expect(putSettingsBody?.error).toMatch(/trial/i);

      // Verify none of the mutations actually persisted.
      const afterProduct = await dbQuery<{ name: string }>(
        `SELECT name FROM products WHERE id = $1`,
        [productId],
      );
      expect(afterProduct.length).toBe(1);
      expect(afterProduct[0].name).not.toBe('renamed');
    } finally {
      // Restore a valid trial window for clean-up hygiene.
      await extendTrial(tenant.tenantId, 30).catch(() => undefined);
    }
  });
});
