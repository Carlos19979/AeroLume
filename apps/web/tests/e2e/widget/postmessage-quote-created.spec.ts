/**
 * widget/postmessage-quote-created.spec.ts
 *
 * End-to-end test of the Aerolume embed widget: loads a host page that hosts
 * the built widget IIFE, completes the full configurator flow inside the
 * iframe, and asserts that the widget's `onQuoteCreated` / `onProductSelected`
 * callbacks fire with the expected payload shape.
 *
 * Strategy
 * --------
 * The widget loader (`apps/widget/dist/aerolume.iife.js`) creates an iframe
 * pointing at `http://localhost:3000/embed?key=<apiKey>` and relays
 * postMessage events (`aerolume:resize`, `aerolume:boat-selected`,
 * `aerolume:product-selected`, `aerolume:quote-created`) into user-supplied
 * callbacks. We:
 *
 *   1) Use `createTestTenant` + `createApiKey` to provision a clean tenant
 *      with its own API key (the embed route validates the key against the
 *      tenant).
 *   2) Seed a deterministic boat under the tenant so `/api/v1/boats/search`
 *      returns at least one hit for the test query (the default search is
 *      scoped to the tenant; public boats seeded in dev may or may not
 *      exist in CI).
 *   3) Serve a minimal HTML host page via `page.setContent` that
 *      (a) defines `window.__events` + callbacks, then
 *      (b) injects the built widget via `page.addScriptTag({ path })`, then
 *      (c) calls `window.Aerolume.init({ apiKey, container, ... })`.
 *   4) Drive the iframe through the 5 configurator steps
 *      (boat → products → configure → preview → contact) and submit.
 *   5) Wait for `window.__events` to contain a `quote` entry (the host
 *      page's `onQuoteCreated` pushes it), then assert shape:
 *        - `quoteId` is a UUID
 *        - `boat.model` matches the seeded boat
 *        - `product.name` matches the card the test clicked
 *        - `sailArea` is numeric (> 0)
 *        - `customSurface` is a boolean
 *
 * Known gap
 * ---------
 * The configurator currently emits `aerolume:product-selected` and
 * `aerolume:quote-created` but NOT `aerolume:boat-selected`. The spec
 * therefore asserts `product` + `quote` events, and asserts on the boat
 * shape via the `quote` payload (which embeds the selected boat). If the
 * boat-selected postMessage is added later, extend this spec to assert a
 * `boat` event as well.
 */

import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

const TEST_PASSWORD = 'TestPassword123!';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Path to the built widget IIFE. The file is built by
// `pnpm --filter @aerolume/widget build` (run once in CI before Playwright,
// or locally via `pnpm build`). This path is stable relative to this spec.
const WIDGET_IIFE_PATH = path.resolve(
  __dirname,
  '../../../../widget/dist/aerolume.iife.js',
);

function getServiceClient(): SupabaseClient {
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_KEY not set');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Seed a boat scoped to the tenant so the search step is deterministic. */
async function seedBoat(tenantId: string, model: string): Promise<void> {
  const sql = postgres(process.env.E2E_DATABASE_URL!, { max: 1, idle_timeout: 2 });
  try {
    // Seed every per-sail-type column the configurator might inspect for
    // `getEffectiveArea` (boat[product.sailType]). The product picked by the
    // test is whichever card renders first, so we cannot predict the
    // sailType — populate them all with sensible non-zero values.
    await sql`
      INSERT INTO boats (
        tenant_id, model, length,
        gvstd, gvfull, gve, gse, gn, gen, spisym, spiasy, furling,
        mainsail_area, mainsail_full_area, mainsail_furler_area,
        genoa_area, genoa_furler_area,
        spinnaker_area, spinnaker_asym_area, sgen_area
      )
      VALUES (
        ${tenantId}::uuid, ${model}, 12.5,
        42.0, 45.0, 40.0, 30.0, 38.0, 35.0, 90.0, 95.0, 33.0,
        42.0, 45.0, 33.0,
        35.0, 32.0,
        90.0, 95.0, 38.0
      )
    `;
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}

/**
 * Install the widget host on the page. We use `page.setContent` for full
 * control over origin ("about:blank") and inject the widget IIFE via
 * addScriptTag so we don't need a separate widget web server.
 */
async function mountWidgetHost(page: Page, apiKey: string): Promise<void> {
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Widget Host</title></head>
  <body>
    <div id="aerolume"></div>
    <script>
      window.__events = [];
      window.__ready = false;
    </script>
  </body>
</html>`;
  // The widget IIFE picks its EMBED_BASE_URL based on `window.location.hostname`
  // — `localhost` => `http://localhost:3000/embed`, anything else => prod
  // (`https://app.aerolume.com/embed`). `about:blank` has an empty hostname,
  // which would route the iframe at the production URL and leave it empty in
  // the test runner. Navigate to the local baseURL first so the widget picks
  // the localhost embed origin.
  await page.goto('/');
  await page.setContent(html);
  await page.addScriptTag({ path: WIDGET_IIFE_PATH });

  // Inject the API key + init call. The inline callbacks push into __events.
  await page.evaluate((key) => {
    (window as unknown as { __API_KEY__: string }).__API_KEY__ = key;
    const aero = (window as unknown as { Aerolume?: { init: (cfg: unknown) => void } }).Aerolume;
    if (!aero) throw new Error('window.Aerolume not defined after injecting widget script');
    aero.init({
      apiKey: key,
      container: '#aerolume',
      onBoatSelected: (b: unknown) => {
        (window as unknown as { __events: unknown[] }).__events.push({ type: 'boat', payload: b });
      },
      onProductSelected: (p: unknown) => {
        (window as unknown as { __events: unknown[] }).__events.push({ type: 'product', payload: p });
      },
      onQuoteCreated: (q: unknown) => {
        (window as unknown as { __events: unknown[] }).__events.push({ type: 'quote', payload: q });
      },
    });
    (window as unknown as { __ready: boolean }).__ready = true;
  }, apiKey);
}

test.describe('widget: postMessage quote-created', () => {
  test.setTimeout(90_000); // full flow: search + select + 4 step nav + submit

  test('full flow inside iframe fires onQuoteCreated with expected shape', async ({
    page,
    browser,
  }, testInfo) => {
    const uniq = `${testInfo.workerIndex}-${Date.now()}`;
    const email = `e2e-widget-${uniq}@aerolume.test`;
    const boatModel = `WidgetBoat-${uniq}`;
    const supabase = getServiceClient();

    // -----------------------------------------------------------------
    // Provision user + tenant + API key (direct service-role path).
    // -----------------------------------------------------------------
    const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (userErr || !userData?.user) {
      throw new Error(`Failed to create test user: ${userErr?.message ?? 'unknown'}`);
    }
    const userId = userData.user.id;

    let tenantId: string | null = null;
    try {
      const created = await createTestTenant({ ownerUserId: userId, withApiKey: true });
      tenantId = created.tenantId;
      const apiKey = created.apiKey!;

      await seedBoat(tenantId, boatModel);

      // -----------------------------------------------------------------
      // Mount widget host + init.
      // -----------------------------------------------------------------
      await mountWidgetHost(page, apiKey);

      // Wait until __ready flips true.
      await page.waitForFunction(() => (window as unknown as { __ready: boolean }).__ready === true);

      // -----------------------------------------------------------------
      // Drive the configurator inside the iframe.
      // -----------------------------------------------------------------
      const frame = page.frameLocator('iframe');
      // (1) Boat step — search + select first result.
      const search = frame.getByTestId('embed-boat-search');
      await expect(search).toBeVisible({ timeout: 20_000 });
      await search.fill(boatModel);

      // First result — the seeded boat. The testid is index-based.
      const firstResult = frame.getByTestId('embed-boat-result-0');
      await expect(firstResult).toBeVisible({ timeout: 10_000 });
      await firstResult.click();

      // (2) Product step — pick the first product card. Capture its name
      //     before clicking so we can assert against the quote event.
      const firstProduct = frame.locator('[data-testid^="embed-product-card-"]').first();
      await expect(firstProduct).toBeVisible({ timeout: 20_000 });
      const productName = (await firstProduct.innerText()).split('\n')[0].trim();
      await firstProduct.click();

      // (3) Configure → preview.
      await frame.getByTestId('embed-continue-configure').click();
      // (4) Preview → contact.
      await frame.getByTestId('embed-continue-preview').click();

      // (5) Contact — fill name/email and submit.
      await frame.getByPlaceholder('Tu nombre').fill('E2E Widget Tester');
      await frame.getByPlaceholder('tu@email.com').fill(`widget-${uniq}@aerolume.test`);
      await frame.getByTestId('embed-submit-quote').click();

      // -----------------------------------------------------------------
      // Wait for onQuoteCreated to have fired on the host page.
      // -----------------------------------------------------------------
      await page.waitForFunction(
        () =>
          (window as unknown as { __events: Array<{ type: string }> }).__events.some(
            (e) => e.type === 'quote',
          ),
        null,
        { timeout: 30_000 },
      );

      // Snapshot the full event list.
      const events = await page.evaluate(
        () => (window as unknown as { __events: Array<{ type: string; payload: unknown }> }).__events,
      );

      // Basic assertion: both product + quote events present. (boat event is
      // a known gap — configurator does not emit aerolume:boat-selected yet.)
      expect(events.some((e) => e.type === 'product')).toBe(true);
      expect(events.some((e) => e.type === 'quote')).toBe(true);

      const quoteEvent = events.find((e) => e.type === 'quote') as {
        type: 'quote';
        payload: {
          quoteId: string;
          boat: { model: string };
          product: { name: string };
          sailArea: number | string | null;
          customSurface: boolean;
        };
      };

      expect(quoteEvent.payload.quoteId).toMatch(UUID_RE);
      expect(quoteEvent.payload.boat?.model).toBe(boatModel);
      expect(quoteEvent.payload.product?.name).toBe(productName);
      expect(typeof quoteEvent.payload.customSurface).toBe('boolean');
      // sailArea should be numeric — the configurator forwards the effective
      // area. Accept either a number or a numeric string.
      const area = Number(quoteEvent.payload.sailArea);
      expect(Number.isFinite(area)).toBe(true);
      expect(area).toBeGreaterThan(0);

      // Product-selected event payload contains name too.
      const productEvent = events.find((e) => e.type === 'product') as {
        type: 'product';
        payload: { name: string };
      };
      expect(productEvent.payload.name).toBe(productName);
    } finally {
      if (tenantId) await cleanupTenant(tenantId).catch(() => undefined);
      await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
    }
  });
});
