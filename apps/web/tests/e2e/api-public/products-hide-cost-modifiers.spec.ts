/**
 * Verifies that the public /api/v1/products endpoint never leaks the retailer's
 * internal cost modifiers. costModifiers is a merchant-only concept used by the
 * server-side pricing engine; clients of the public API must only see
 * msrpModifiers (what the end customer will pay) and percentModifiers.
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery } from '../fixtures/api';

type PublicConfigField = {
  key: string;
  msrpModifiers?: Record<string, number>;
  percentModifiers?: Record<string, number>;
  // costModifiers must never appear — typed only for the negative assertion.
  costModifiers?: unknown;
};

type PublicProduct = {
  id: string;
  configFields: PublicConfigField[];
};

test.describe('api-public: /api/v1/products hides internal cost modifiers', () => {
  test('response exposes msrpModifiers but not costModifiers', async ({ baseURL, tenant }) => {
    const [p] = await dbQuery<{ id: string }>(
      `SELECT id FROM products WHERE tenant_id = $1 LIMIT 1`,
      [tenant.tenantId],
    );
    expect(p, 'tenant should have at least one cloned product').toBeDefined();

    // Seed a field with distinct cost and msrp modifiers so the cost leaks would
    // be visible if the endpoint ever regressed.
    const fieldKey = `color-hide-${Date.now()}`;
    await dbQuery(
      `INSERT INTO product_config_fields
         (product_id, key, label, field_type, options, required, cost_modifiers, msrp_modifiers, percent_modifiers)
       VALUES ($1, $2, 'Color', 'select', $3::jsonb, true, $4::jsonb, $5::jsonb, $6::jsonb)`,
      [
        p.id,
        fieldKey,
        JSON.stringify(['Premium']),
        JSON.stringify({ Premium: 80 }),
        JSON.stringify({ Premium: 120 }),
        JSON.stringify({}),
      ],
    );

    const api = apiClient(baseURL!, tenant.apiKey);
    const { status, body } = await api.get<{ data: PublicProduct[] }>('/api/v1/products');
    expect(status).toBe(200);

    const target = body.data.find((x) => x.id === p.id);
    expect(target, 'seeded product should appear in /v1/products').toBeDefined();

    const field = target!.configFields.find((f) => f.key === fieldKey);
    expect(field, 'seeded field should appear on the product').toBeDefined();

    // Positive: msrpModifiers is exposed with the value we seeded.
    expect(field!.msrpModifiers).toEqual({ Premium: 120 });

    // Negative: neither the camelCase nor the snake_case version of the cost
    // column is ever serialized. Catches Drizzle `select()` regressions.
    const raw = field as unknown as Record<string, unknown>;
    expect(raw).not.toHaveProperty('costModifiers');
    expect(raw).not.toHaveProperty('cost_modifiers');
  });
});
