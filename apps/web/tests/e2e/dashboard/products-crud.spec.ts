/**
 * Sprint 2 – products-crud.spec.ts
 *
 * Covers Create / Edit (toggle-active) / Delete for the tenant products page.
 * Edit of name/sailType is done via the product detail page (router.push); we
 * skip that deep-dive here and focus on mutations available on the list page.
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

test.describe('dashboard: products CRUD', () => {
  test('create – new product appears in table and DB', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/products');

    // Open the create form
    await page.getByTestId(CRUD.product.createButton).click();

    const productName = `Test Sail ${Date.now()}`;
    await page.getByTestId(CRUD.product.createName).fill(productName);
    // Leave sailType as default (gvstd)

    await page.getByTestId(CRUD.product.createSubmit).click();

    // Wait for the create form to close (product-create-button reappears)
    await expect(page.getByTestId(CRUD.product.createButton)).toBeVisible({ timeout: 10_000 });

    // Assert UI shows the product name
    await expect(page.getByRole('button', { name: productName })).toBeVisible({ timeout: 10_000 });

    // Assert DB row exists
    const rows = await dbQuery<{ id: string; name: string; tenant_id: string }>(
      `SELECT id, name, tenant_id FROM products WHERE name = $1 AND tenant_id = $2`,
      [productName, tenant.tenantId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].tenant_id).toBe(tenant.tenantId);
  });

  test('toggle active – button round-trips state in UI and DB', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/products');

    // Pick the first product row
    const firstRow = page.locator('tr[data-testid^="product-row-"]').first();
    await expect(firstRow).toBeVisible();

    const rowTestId = await firstRow.getAttribute('data-testid');
    expect(rowTestId).toBeTruthy();
    const productId = rowTestId!.replace('product-row-', '');

    // Read current DB active state
    const [before] = await dbQuery<{ active: boolean }>(
      `SELECT active FROM products WHERE id = $1`,
      [productId],
    );
    const initialActive = before.active;

    // Click toggle
    await page.getByTestId(CRUD.product.toggleActive(productId)).click();

    // Wait for UI to update (button text changes)
    const expectedLabel = initialActive ? 'Activar' : 'Desactivar';
    await expect(page.getByTestId(CRUD.product.toggleActive(productId))).toHaveText(expectedLabel);

    // Assert DB flipped
    const [after] = await dbQuery<{ active: boolean }>(
      `SELECT active FROM products WHERE id = $1`,
      [productId],
    );
    expect(after.active).toBe(!initialActive);

    // Toggle back so we don't break products-list.spec.ts expectations
    await page.getByTestId(CRUD.product.toggleActive(productId)).click();
    await expect(page.getByTestId(CRUD.product.toggleActive(productId))).toHaveText(
      initialActive ? 'Desactivar' : 'Activar',
    );
  });

  test('delete – product disappears from table and is removed from DB', async ({ page, tenant }) => {
    // Create a product via the UI so we have one we can safely delete
    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/products');

    await page.getByTestId(CRUD.product.createButton).click();
    const productName = `Delete Me ${Date.now()}`;
    await page.getByTestId(CRUD.product.createName).fill(productName);
    await page.getByTestId(CRUD.product.createSubmit).click();
    // Wait for form to close then product to appear
    await expect(page.getByTestId(CRUD.product.createButton)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: productName })).toBeVisible({ timeout: 10_000 });

    // Locate the new row id
    const rows = await dbQuery<{ id: string }>(
      `SELECT id FROM products WHERE name = $1 AND tenant_id = $2`,
      [productName, tenant.tenantId],
    );
    expect(rows).toHaveLength(1);
    const pid = rows[0].id;

    // Accept the confirm dialog, then click delete
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId(CRUD.product.deleteBtn(pid)).click();

    // Row must disappear
    await expect(page.locator(`[data-testid="product-row-${pid}"]`)).not.toBeVisible();

    // DB row should be gone (hard delete)
    const afterRows = await dbQuery<{ id: string }>(
      `SELECT id FROM products WHERE id = $1`,
      [pid],
    );
    expect(afterRows).toHaveLength(0);
  });
});
