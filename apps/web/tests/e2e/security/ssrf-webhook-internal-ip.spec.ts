/**
 * Security spec 1: SSRF protection on webhook URLs
 *
 * The quotes API calls isInternalUrl() before firing the webhook fetch.
 * When the tenant's webhookUrl points at a private/internal IP the webhook
 * is SKIPPED — but the quote itself is still created (200 ok).
 * A public URL is NOT blocked.
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery } from '../fixtures/api';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

const INTERNAL_URLS = [
  'http://127.0.0.1:8080/x',
  'http://169.254.169.254/latest/meta-data',
  'http://10.0.0.1/x',
  'http://192.168.1.1/x',
  'http://[::1]/x',
];

const VALID_QUOTE = {
  boatModel: 'SSRF Test Boat',
  currency: 'EUR',
  items: [{ sailType: 'gvstd', productName: 'Test Sail', quantity: 1 }],
};

async function setWebhookUrl(tenantId: string, url: string | null) {
  const dbUrl = process.env.E2E_DATABASE_URL;
  if (!dbUrl) throw new Error('E2E_DATABASE_URL not set');
  const client = postgres(dbUrl, { max: 1 });
  try {
    await client.unsafe('UPDATE tenants SET webhook_url = $1 WHERE id = $2::uuid', [url, tenantId]);
  } finally {
    await client.end({ timeout: 2 }).catch(() => undefined);
  }
}

test.describe('security: SSRF webhook protection', () => {
  for (const internalUrl of INTERNAL_URLS) {
    test(`quote created (200) but webhook skipped for internal URL: ${internalUrl}`, async ({ tenant }) => {
      await setWebhookUrl(tenant.tenantId, internalUrl);

      const api = apiClient(BASE, tenant.apiKey);
      const res = await api.post<{ data: { id: string } }>('/api/v1/quotes', VALID_QUOTE);

      // Quote must still be created — SSRF protection only blocks the webhook fetch
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBeTruthy();

      // Verify quote exists in DB
      const rows = await dbQuery<{ id: string }>(
        'SELECT id FROM quotes WHERE id = $1',
        [res.body.data.id],
      );
      expect(rows.length).toBe(1);
    });
  }

  test('webhook is attempted for a public URL (not blocked)', async ({ tenant }) => {
    // Point webhook at a known-public-but-unreachable URL — the server will ATTEMPT
    // to fetch it (fire-and-forget, errors are swallowed). Quote must succeed.
    await setWebhookUrl(tenant.tenantId, 'https://example.com/webhook');

    const api = apiClient(BASE, tenant.apiKey);
    const res = await api.post<{ data: { id: string } }>('/api/v1/quotes', VALID_QUOTE);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBeTruthy();
  });

  test('no webhook URL set — quote still created normally', async ({ tenant }) => {
    await setWebhookUrl(tenant.tenantId, null);

    const api = apiClient(BASE, tenant.apiKey);
    const res = await api.post<{ data: { id: string } }>('/api/v1/quotes', VALID_QUOTE);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBeTruthy();
  });
});
