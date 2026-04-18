/**
 * Security spec 2: CORS headers on /api/v1/* routes
 *
 * withCors() in src/lib/cors.ts reflects the request's Origin header back as
 * Access-Control-Allow-Origin when an Origin is present. If no Origin header is
 * sent the header is absent (server-to-server compatibility).
 *
 * Access-Control-Allow-Headers is: "Authorization, Content-Type"
 * Access-Control-Allow-Methods is: "GET, POST, OPTIONS"
 */
import { test, expect } from '../fixtures/auth';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function options(path: string, origin: string) {
  return fetch(`${BASE}${path}`, {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
  });
}

async function getWithOrigin(path: string, apiKey: string, origin: string) {
  return fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: { 'x-api-key': apiKey, Origin: origin },
  });
}

test.describe('security: CORS headers on /api/v1/*', () => {
  for (const route of ['/api/v1/products', '/api/v1/quotes']) {
    test(`OPTIONS preflight ${route} returns 204 with CORS headers`, async ({ tenant }) => {
      const res = await options(route, 'https://retailer.example.com');

      expect([200, 204]).toContain(res.status);
      expect(res.headers.get('access-control-allow-origin')).toBe('https://retailer.example.com');
      expect(res.headers.get('access-control-allow-methods')).toMatch(/GET/i);
      expect(res.headers.get('access-control-allow-methods')).toMatch(/POST/i);
      // Allow-Headers must include content-type
      const allowHeaders = res.headers.get('access-control-allow-headers') ?? '';
      expect(allowHeaders.toLowerCase()).toContain('content-type');
    });

    test(`GET ${route} with foreign Origin reflects origin back`, async ({ tenant }) => {
      // /api/v1/quotes only supports POST (no GET handler); only test GET on products.
      // For quotes, verify via OPTIONS that the origin is echoed.
      if (route === '/api/v1/quotes') {
        const res = await options(route, 'https://evil.example');
        expect([200, 204]).toContain(res.status);
        expect(res.headers.get('access-control-allow-origin')).toBe('https://evil.example');
        return;
      }
      const evilOrigin = 'https://evil.example';
      const res = await getWithOrigin(route, tenant.apiKey, evilOrigin);

      // The route returns data (200) because API key is valid and allowedOrigins is
      // unconfigured (empty → allow all). CORS header echoes the origin.
      expect(res.status).toBe(200);
      expect(res.headers.get('access-control-allow-origin')).toBe(evilOrigin);
    });
  }

  test('GET /api/v1/products without Origin header has no ACAO header', async ({ tenant }) => {
    const res = await fetch(`${BASE}/api/v1/products`, {
      headers: { 'x-api-key': tenant.apiKey },
    });
    expect(res.status).toBe(200);
    // No origin → withCors() sets no ACAO header (server-side call, skip CORS)
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
