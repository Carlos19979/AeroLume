/**
 * Verifies that /api/internal/products/[id]/fields persists costModifiers and
 * msrpModifiers as independent jsonb columns (not coupled).
 *
 * Context: `priceModifiers` was split into two columns so retailers can book
 * margin on optional extras. This spec locks in that they round-trip separately
 * through the API and land in the expected DB columns.
 */
import { test, expect } from '../fixtures/auth';
import { dbQuery } from '../fixtures/api';
import type { Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /iniciar sesion|entrando/i }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

test.describe('api-internal: product config fields persist cost and msrp modifiers independently', () => {
  test('POST then UPDATE round-trip keeps both maps distinct', async ({ page, tenant }) => {
    await loginAs(page, tenant.email, tenant.password);

    const [p] = await dbQuery<{ id: string }>(
      `SELECT id FROM products WHERE tenant_id = $1 LIMIT 1`,
      [tenant.tenantId],
    );
    expect(p, 'tenant should have at least one cloned product').toBeDefined();

    const createPayload = {
      key: 'color-split',
      label: 'Color',
      fieldType: 'select',
      options: ['Standard', 'Premium'],
      required: false,
      costModifiers: { Premium: 80, Standard: 0 },
      msrpModifiers: { Premium: 120, Standard: 0 },
      percentModifiers: {},
    };

    const createRes = await page.request.post(`/api/internal/products/${p.id}/fields`, {
      data: createPayload,
      headers: { 'content-type': 'application/json' },
    });
    expect(createRes.status()).toBe(200);
    const created = (await createRes.json()).data as { id: string };

    const [row] = await dbQuery<{
      cost_modifiers: Record<string, number>;
      msrp_modifiers: Record<string, number>;
    }>(
      `SELECT cost_modifiers, msrp_modifiers FROM product_config_fields WHERE id = $1`,
      [created.id],
    );
    expect(row.cost_modifiers).toEqual({ Premium: 80, Standard: 0 });
    expect(row.msrp_modifiers).toEqual({ Premium: 120, Standard: 0 });

    // PUT: change only costModifiers; msrpModifiers must stay untouched.
    const updatePayload = {
      ...createPayload,
      id: created.id,
      costModifiers: { Premium: 50, Standard: 0 },
    };
    const updateRes = await page.request.put(`/api/internal/products/${p.id}/fields`, {
      data: updatePayload,
      headers: { 'content-type': 'application/json' },
    });
    expect(updateRes.status()).toBe(200);

    const [after] = await dbQuery<{
      cost_modifiers: Record<string, number>;
      msrp_modifiers: Record<string, number>;
    }>(
      `SELECT cost_modifiers, msrp_modifiers FROM product_config_fields WHERE id = $1`,
      [created.id],
    );
    expect(after.cost_modifiers).toEqual({ Premium: 50, Standard: 0 });
    expect(after.msrp_modifiers).toEqual({ Premium: 120, Standard: 0 });
  });
});
