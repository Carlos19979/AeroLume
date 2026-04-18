/**
 * Spec 3: POST /api/v1/quotes — server recomputes unitPrice and cost.
 *
 * Ensures that even if the client sends an arbitrary unitPrice, the server uses
 * the tier table for Mayor Clásica Cruising (tier 21-32) to derive:
 *   unit_price ≈ 25 * 60.92 = 1523
 *   cost       ≈ 25 * 43.51 = 1087.75
 *
 * Also covers two additional edge cases:
 *   - Missing sailArea -> priceItem returns null -> cost is null, unit_price
 *     falls back to whatever the client sent (or null).
 *   - sailArea outside any tier (e.g. 200 m²) -> fallback to product.basePrice /
 *     product.costPerSqm (both are currently null in the base catalog, so
 *     priceItem returns null).
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery } from '../fixtures/api';

test.describe('api v1: POST /api/v1/quotes — server-authoritative pricing', () => {
  test('recomputes unitPrice and cost from tier (ignores client-sent unitPrice)', async ({
    tenant,
    baseURL,
  }) => {
    const rows = await dbQuery<{ id: string }>(
      `SELECT id FROM products
       WHERE tenant_id = $1 AND sail_type = 'gvstd' AND variant = 'cruising'
       LIMIT 1`,
      [tenant.tenantId],
    );
    expect(rows.length).toBe(1);
    const productId = rows[0].id;

    const api = apiClient(baseURL!, tenant.apiKey);
    const { status, body } = await api.post<{ data: { id: string; status: string } }>(
      '/api/v1/quotes',
      {
        boatModel: 'Test',
        customerName: 'E2E',
        customerEmail: 'e2e-pricing@aerolume.test',
        items: [
          {
            productId,
            sailType: 'gvstd',
            productName: 'Mayor Clásica Cruising',
            sailArea: '25',
            unitPrice: '999999', // intentional garbage from the client
            quantity: 1,
            configuration: {},
          },
        ],
      },
    );

    expect(status).toBe(200);
    expect(body?.data?.id).toBeTruthy();
    const quoteId = body.data.id;

    const items = await dbQuery<{ unit_price: string; cost: string }>(
      `SELECT unit_price, cost FROM quote_items WHERE quote_id = $1`,
      [quoteId],
    );
    expect(items.length).toBe(1);
    const unit = Number(items[0].unit_price);
    const cost = Number(items[0].cost);
    // Server recomputed: 25 * 60.92 = 1523, NOT 999999.
    expect(Math.abs(unit - 1523)).toBeLessThan(1);
    expect(Math.abs(cost - 1087.75)).toBeLessThan(1);
  });

  test('missing sailArea leaves unitPrice at client value (or null) and cost null', async ({
    tenant,
    baseURL,
  }) => {
    const rows = await dbQuery<{ id: string }>(
      `SELECT id FROM products
       WHERE tenant_id = $1 AND sail_type = 'gvstd' AND variant = 'cruising'
       LIMIT 1`,
      [tenant.tenantId],
    );
    const productId = rows[0].id;

    const api = apiClient(baseURL!, tenant.apiKey);
    const { status, body } = await api.post<{ data: { id: string } }>('/api/v1/quotes', {
      boatModel: 'Test',
      customerName: 'E2E',
      customerEmail: 'e2e-pricing-noarea@aerolume.test',
      items: [
        {
          productId,
          sailType: 'gvstd',
          productName: 'Mayor Clásica Cruising',
          // no sailArea
          quantity: 1,
          configuration: {},
        },
      ],
    });
    expect(status).toBe(200);
    const quoteId = body.data.id;

    const items = await dbQuery<{ unit_price: string | null; cost: string | null }>(
      `SELECT unit_price, cost FROM quote_items WHERE quote_id = $1`,
      [quoteId],
    );
    expect(items.length).toBe(1);
    // priceItem returned null -> cost is null, unit_price falls back to client value (none sent -> null).
    expect(items[0].cost).toBeNull();
    expect(items[0].unit_price).toBeNull();
  });

  test('sailArea outside any tier falls back to product basePrice/costPerSqm', async ({
    tenant,
    baseURL,
  }) => {
    const rows = await dbQuery<{ id: string; base_price: string | null; cost_per_sqm: string | null }>(
      `SELECT id, base_price, cost_per_sqm FROM products
       WHERE tenant_id = $1 AND sail_type = 'gvstd' AND variant = 'cruising'
       LIMIT 1`,
      [tenant.tenantId],
    );
    const product = rows[0];
    const productId = product.id;

    const api = apiClient(baseURL!, tenant.apiKey);
    const { status, body } = await api.post<{ data: { id: string } }>('/api/v1/quotes', {
      boatModel: 'Test',
      customerName: 'E2E',
      customerEmail: 'e2e-pricing-oor@aerolume.test',
      items: [
        {
          productId,
          sailType: 'gvstd',
          productName: 'Mayor Clásica Cruising',
          sailArea: '200', // outside every tier (max tier ends at 70)
          quantity: 1,
          configuration: {},
        },
      ],
    });
    expect(status).toBe(200);
    const quoteId = body.data.id;

    const items = await dbQuery<{ unit_price: string | null; cost: string | null }>(
      `SELECT unit_price, cost FROM quote_items WHERE quote_id = $1`,
      [quoteId],
    );
    expect(items.length).toBe(1);

    // Fallback uses product.basePrice / costPerSqm. If the cloned catalog has
    // those set, we expect sailArea * basePrice / costPerSqm. If not, priceItem
    // returns null and the DB row has null cost.
    const basePrice = product.base_price ? Number(product.base_price) : null;
    const costPerSqm = product.cost_per_sqm ? Number(product.cost_per_sqm) : null;

    if (basePrice && basePrice > 0 && costPerSqm && costPerSqm > 0) {
      const expectedUnit = 200 * basePrice;
      const expectedCost = 200 * costPerSqm;
      expect(Math.abs(Number(items[0].unit_price) - expectedUnit)).toBeLessThan(1);
      expect(Math.abs(Number(items[0].cost) - expectedCost)).toBeLessThan(1);
    } else {
      // Without fallback coefficients priceItem returns null.
      expect(items[0].cost).toBeNull();
      expect(items[0].unit_price).toBeNull();
    }
  });
});
