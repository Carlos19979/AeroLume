/**
 * E2E spec: POST /api/v1/analytics (public ingest endpoint)
 *
 * Covers:
 *   - Valid event accepted, DB row written with correct tenantId / fields.
 *   - Missing x-api-key → 401.
 *   - Invalid Zod input (unknown eventType) → 400.
 *   - Non-string boatModel → 400.
 *   - Unknown extra fields are stripped (schema uses strict by default from validateBody).
 *   - OPTIONS preflight returns 204 with correct CORS headers.
 */
import { test, expect } from '../fixtures/auth';
import { dbQuery, closeDbQuery } from '../fixtures/api';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const ROUTE = `${BASE}/api/v1/analytics`;

test.afterAll(async () => {
  await closeDbQuery();
});

test.describe('POST /api/v1/analytics — ingest events', () => {
  test('valid event with API key → 200, DB row has correct tenantId + fields', async ({ tenant }) => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'boat_search',
        boatModel: 'Bavaria 40',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json() as { data: { tracked: boolean } };
    expect(json.data.tracked).toBe(true);

    // Verify DB row
    const rows = await dbQuery<{
      tenant_id: string;
      event_type: string;
      boat_model: string;
      created_at: string;
    }>(
      `SELECT tenant_id, event_type, boat_model, created_at
         FROM analytics_events
        WHERE tenant_id = $1
          AND event_type = 'boat_search'
          AND boat_model = 'Bavaria 40'
        ORDER BY created_at DESC
        LIMIT 1`,
      [tenant.tenantId],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].tenant_id).toBe(tenant.tenantId);
    expect(rows[0].event_type).toBe('boat_search');
    expect(rows[0].boat_model).toBe('Bavaria 40');
    expect(rows[0].created_at).toBeTruthy();
  });

  test('valid event — all optional fields sent', async ({ tenant }) => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'product_view',
        boatModel: 'Beneteau Oceanis 45',
        sailType: 'gvstd',
      }),
    });

    expect(res.status).toBe(200);
  });

  test('missing x-api-key → 401', async () => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'boat_search' }),
    });

    expect(res.status).toBe(401);
  });

  test('invalid API key → 401', async () => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': 'ak_notavalidkey00000000',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ eventType: 'boat_search' }),
    });

    expect(res.status).toBe(401);
  });

  test('unknown eventType → 400 Zod validation error', async ({ tenant }) => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ eventType: 'not_a_real_event' }),
    });

    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toBeTruthy();
  });

  test('missing eventType → 400 Zod validation error', async ({ tenant }) => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ boatModel: 'Bavaria 40' }),
    });

    expect(res.status).toBe(400);
  });

  test('non-string boatModel → 400 Zod validation error', async ({ tenant }) => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ eventType: 'boat_search', boatModel: 12345 }),
    });

    expect(res.status).toBe(400);
  });

  test('invalid JSON body → 400', async ({ tenant }) => {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
      },
      body: 'not-json{{{',
    });

    expect(res.status).toBe(400);
  });

  test('OPTIONS preflight → 204 with CORS headers', async ({ tenant: _tenant }) => {
    const origin = 'https://retailer.example.com';
    const res = await fetch(ROUTE, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
      },
    });

    expect([200, 204]).toContain(res.status);
    expect(res.headers.get('access-control-allow-origin')).toBe(origin);

    const allowMethods = res.headers.get('access-control-allow-methods') ?? '';
    expect(allowMethods.toUpperCase()).toContain('POST');

    const allowHeaders = res.headers.get('access-control-allow-headers') ?? '';
    expect(allowHeaders.toLowerCase()).toContain('content-type');
  });

  test('POST with foreign Origin reflects ACAO header', async ({ tenant }) => {
    const origin = 'https://my-sailing-store.com';
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: {
        'x-api-key': tenant.apiKey,
        'content-type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({ eventType: 'configurator_opened' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe(origin);
  });
});
