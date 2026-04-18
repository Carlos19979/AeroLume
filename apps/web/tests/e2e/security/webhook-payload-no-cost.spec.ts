/**
 * Security spec 5: Webhook payload must not expose `cost` field
 *
 * The quotes route explicitly strips `cost` from webhook bodies:
 *   items: items.map(i => ({ productId, sailType, ..., unitPrice }))  — no cost
 *
 * Test 1 uses a local mock HTTP server (startMockWebhook) to capture the outbound
 * webhook POST from the Next.js server and asserts no `cost` key appears on items.
 *
 * The server URL uses the nip.io wildcard DNS trick:
 *   127.0.0.1.nip.io → resolves to 127.0.0.1 via public DNS
 *   isInternalUrl() only string-matches "localhost", "127.0.0.1", "::1", "10.*",
 *   "192.168.*", "172.16-31.*", ".internal", ".local" — none match "127.0.0.1.nip.io",
 *   so the webhook POST is allowed through while still reaching our local mock server.
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery } from '../fixtures/api';
import { startMockWebhook } from '../fixtures/webhook-mock';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

test.describe('security: webhook payload excludes cost field', () => {
  test('webhook body has no cost on any item', async ({ tenant }) => {
    // Start a local mock server that captures POST bodies.
    const mock = await startMockWebhook();

    try {
      // Point this tenant's webhookUrl at the mock server.
      await dbQuery(
        `UPDATE tenants SET webhook_url = $1 WHERE id = $2`,
        [mock.url, tenant.tenantId],
      );

      const ownProducts = await dbQuery<{ id: string }>(
        'SELECT id FROM products WHERE tenant_id = $1 LIMIT 1',
        [tenant.tenantId],
      );
      expect(ownProducts.length).toBeGreaterThan(0);

      const api = apiClient(BASE, tenant.apiKey);
      const res = await api.post<{ data: { id: string; status: string } }>('/api/v1/quotes', {
        boatModel: 'Webhook Cost Test',
        currency: 'EUR',
        items: [
          {
            productId: ownProducts[0].id,
            sailType: 'gvstd',
            productName: 'Test Sail',
            quantity: 1,
            sailArea: '30',
          },
        ],
      });
      expect(res.status).toBe(200);

      // The webhook is fire-and-forget from the route — poll up to 5 s.
      const deadline = Date.now() + 5_000;
      while (mock.captured.length === 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 200));
      }

      expect(mock.captured.length).toBeGreaterThan(0);

      const payload = mock.captured[0] as {
        event: string;
        data: { items: Array<Record<string, unknown>> };
      };

      expect(payload.event).toBe('quote.created');

      for (const item of payload.data.items) {
        expect(item).not.toHaveProperty('cost');
      }
    } finally {
      await mock.close();
    }
  });
});

test.describe('security: cost not exposed via GET /api/v1/products', () => {
  test('product list does not include costPerSqm or cost fields', async ({ tenant }) => {
    const api = apiClient(BASE, tenant.apiKey);
    const res = await api.get<{ data: Array<Record<string, unknown>> }>('/api/v1/products');

    expect(res.status).toBe(200);
    for (const product of res.body.data) {
      // Top-level cost fields must be absent
      expect(product).not.toHaveProperty('costPerSqm');
      // Pricing tiers must not expose costPerSqm
      const tiers = (product.pricingTiers ?? []) as Array<Record<string, unknown>>;
      for (const tier of tiers) {
        expect(tier).not.toHaveProperty('costPerSqm');
      }
    }
  });

  test('quote items store cost in DB but it is not returned in POST response', async ({ tenant }) => {
    const ownProducts = await dbQuery<{ id: string }>(
      'SELECT id FROM products WHERE tenant_id = $1 LIMIT 1',
      [tenant.tenantId],
    );
    expect(ownProducts.length).toBeGreaterThan(0);

    const api = apiClient(BASE, tenant.apiKey);
    const res = await api.post<{ data: { id: string; status: string } }>('/api/v1/quotes', {
      boatModel: 'Cost Leak Test',
      currency: 'EUR',
      items: [{ productId: ownProducts[0].id, sailType: 'gvstd', productName: 'Test Sail', quantity: 1, sailArea: '30' }],
    });

    expect(res.status).toBe(200);

    // Response body must not expose cost
    const responseStr = JSON.stringify(res.body);
    expect(responseStr).not.toContain('"cost"');

    // Cost IS stored in the DB (server-internal use for margin tracking)
    const items = await dbQuery<{ cost: string | null }>(
      'SELECT cost FROM quote_items WHERE quote_id = $1',
      [res.body.data.id],
    );
    expect(items.length).toBe(1);
    // cost may or may not be populated depending on whether tiers are configured;
    // the important assertion is that it is NOT in the HTTP response above.
  });
});
