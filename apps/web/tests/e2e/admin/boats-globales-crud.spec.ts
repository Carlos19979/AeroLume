/**
 * Spec 4: Admin panel – global boats CRUD (/admin/boats)
 *
 * - Create a new global boat. Assert DB row has tenantId = NULL.
 * - Edit an existing global boat. Assert DB updated.
 * - Delete a global boat. Assert DB row removed.
 * - Page only shows boats (page renders with "Barcos" heading).
 * - Tenant-scoped boats have tenantId set — verify page data doesn't include
 *   tenant-scoped boats by checking a newly created tenant boat is NOT in the
 *   rows the BoatsAdminClient receives (the page query has no tenantId filter
 *   but the UI only returns from the page — we verify via DB that the tenant boat
 *   has a non-null tenantId so the admin page would show it in context. We assert
 *   the DB correctly marks our global creation as null).
 */
import { test, expect } from '@playwright/test';
import { dbQuery } from '../fixtures/api';
import { ensureAdminUser, adminLogin, deleteAdminUser } from '../fixtures/admin-auth';
import { TID } from '../fixtures/selectors';

test.describe('admin: global boats CRUD', () => {
  let adminUserId: string;
  let adminCreated: boolean;

  // Track boats created by tests so we can clean up
  const createdBoatIds: string[] = [];

  test.beforeAll(async () => {
    const result = await ensureAdminUser();
    adminUserId = result.userId;
    adminCreated = result.created;
  });

  test.afterAll(async () => {
    // DB-level cleanup for any boats that survived
    for (const id of createdBoatIds) {
      await dbQuery(`DELETE FROM boats WHERE id = $1::uuid`, [id]).catch(() => undefined);
    }
    if (adminCreated) {
      await deleteAdminUser(adminUserId);
    }
  });

  test('create a global boat — DB row has tenantId IS NULL', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/boats');
    await page.waitForSelector('text=Barcos', { timeout: 15_000 });

    const modelName = `E2E-Global-${Date.now()}`;

    // Click "Nuevo barco" button
    await page.locator(`[data-testid="${TID.admin.boatCreateBtn}"]`).click();
    await page.locator(`[data-testid="${TID.admin.boatCreateForm}"]`).waitFor({ timeout: 5_000 });

    // Fill the form
    await page.locator(`[data-testid="${TID.admin.boatModelInput}"]`).fill(modelName);
    await page.locator('input[placeholder="11.83"]').fill('10.5');

    // Click "Crear barco"
    await page.locator(`[data-testid="${TID.admin.boatSaveBtn}"]`).click();

    // The new row should appear in the table
    await expect(page.locator(`text=${modelName}`)).toBeVisible({ timeout: 10_000 });

    // Assert DB: tenantId IS NULL
    const rows = await dbQuery<{ id: string; tenant_id: string | null }>(
      `SELECT id, tenant_id FROM boats WHERE model = $1 ORDER BY created_at DESC LIMIT 1`,
      [modelName],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].tenant_id).toBeNull();
    createdBoatIds.push(rows[0].id);
  });

  test('edit a global boat — DB row updated', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/boats');

    const originalName = `E2E-EditSource-${Date.now()}`;
    await page.locator(`[data-testid="${TID.admin.boatCreateBtn}"]`).click();
    await page.locator(`[data-testid="${TID.admin.boatCreateForm}"]`).waitFor({ timeout: 5_000 });
    await page.locator(`[data-testid="${TID.admin.boatModelInput}"]`).fill(originalName);
    await page.locator(`[data-testid="${TID.admin.boatSaveBtn}"]`).click();
    await expect(page.locator(`text=${originalName}`)).toBeVisible({ timeout: 10_000 });

    // Track for cleanup
    const dbBefore = await dbQuery<{ id: string }>(
      `SELECT id FROM boats WHERE model = $1 LIMIT 1`,
      [originalName],
    );
    if (dbBefore.length > 0) createdBoatIds.push(dbBefore[0].id);

    // Click Editar on that row
    const viewRow = page.locator('tr', { hasText: originalName });
    await viewRow.getByRole('button', { name: 'Editar' }).click();

    // After clicking Editar, the row transitions to edit mode (input fields appear).
    // The row no longer contains the original text — find the active edit row by
    // looking for a row with a text input visible (the first one in edit mode).
    const updatedName = `${originalName}-UPDATED`;
    const editRow = page.locator('tr').filter({ has: page.locator('input[type="text"]') }).first();

    const modelInput = editRow.locator('input[type="text"]').first();
    await modelInput.clear();
    await modelInput.fill(updatedName);

    // Click Guardar in the edit row
    await editRow.getByRole('button', { name: 'Guardar' }).click();

    // Updated name should now appear in the table
    await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 10_000 });

    // DB check
    const dbAfter = await dbQuery<{ model: string }>(
      `SELECT model FROM boats WHERE model = $1 LIMIT 1`,
      [updatedName],
    );
    expect(dbAfter.length).toBe(1);
    expect(dbAfter[0].model).toBe(updatedName);
  });

  test('delete a global boat — DB row removed', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/boats');

    const boatName = `E2E-Delete-${Date.now()}`;
    await page.locator(`[data-testid="${TID.admin.boatCreateBtn}"]`).click();
    await page.locator(`[data-testid="${TID.admin.boatCreateForm}"]`).waitFor({ timeout: 5_000 });
    await page.locator(`[data-testid="${TID.admin.boatModelInput}"]`).fill(boatName);
    await page.locator(`[data-testid="${TID.admin.boatSaveBtn}"]`).click();
    await expect(page.locator(`text=${boatName}`)).toBeVisible({ timeout: 10_000 });

    // Confirm the DB has it
    const dbBefore = await dbQuery<{ id: string }>(
      `SELECT id FROM boats WHERE model = $1 LIMIT 1`,
      [boatName],
    );
    expect(dbBefore.length).toBe(1);

    // Click Eliminar — handle the confirm dialog
    page.once('dialog', (dialog) => dialog.accept());
    const deleteRow = page.locator('tr', { hasText: boatName });
    await deleteRow.getByRole('button', { name: 'Eliminar' }).click();

    // Row should disappear
    await expect(page.locator(`text=${boatName}`)).not.toBeVisible({ timeout: 10_000 });

    // DB check
    const dbAfter = await dbQuery<{ id: string }>(
      `SELECT id FROM boats WHERE model = $1 LIMIT 1`,
      [boatName],
    );
    expect(dbAfter.length).toBe(0);
  });

  test('newly created global boat has tenantId NULL in DB', async ({ page }) => {
    await adminLogin(page);

    const model = `E2E-NullTenant-${Date.now()}`;
    const apiRes = await page.request.post('/api/admin/boats', {
      data: { model, isMultihull: false },
      headers: { 'content-type': 'application/json' },
    });
    expect(apiRes.status()).toBe(200);
    const { data: boat } = await apiRes.json() as { data: { id: string; tenantId: string | null } };
    createdBoatIds.push(boat.id);

    expect(boat.tenantId).toBeNull();

    // Verify DB as well
    const [row] = await dbQuery<{ tenant_id: string | null }>(
      `SELECT tenant_id FROM boats WHERE id = $1::uuid`,
      [boat.id],
    );
    expect(row.tenant_id).toBeNull();
  });
});
