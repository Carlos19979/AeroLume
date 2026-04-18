import { test, expect } from '@playwright/test';
import { TID } from '../fixtures/selectors';
import { dbQuery } from '../fixtures/api';

/**
 * Spec 1 — Full happy path (no expert mode).
 * Uses the dev-tenant demo API key (NEXT_PUBLIC_DEMO_API_KEY).
 * Verifies the whole flow ends with a `quote` row + `quote_items.cost`.
 */

const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY;

test.describe('configurator: full happy path', () => {
  test.skip(!DEMO_KEY, 'NEXT_PUBLIC_DEMO_API_KEY not set');

  test('boat → product → configure → preview → contact → submit → DB quote', async ({ page }) => {
    const email = `e2e-happy-${Date.now()}@aerolume.test`;

    await page.goto(`/embed?key=${DEMO_KEY}`);

    // Step 1: boat pill active
    const boatPill = page.getByTestId(TID.embed.stepPill('boat'));
    await expect(boatPill).toBeVisible();

    // Fill boat search with "Bavaria" and wait for results
    const search = page.getByTestId(TID.embed.boatSearch);
    await search.fill('Bavaria');

    // The search debounce uses useDeferredValue. Wait for at least one result to appear.
    const firstResult = page.getByTestId('embed-boat-result-0');
    await firstResult.waitFor({ state: 'visible', timeout: 10_000 });
    await firstResult.click();

    // Step 2: products pill active
    await expect(page.getByTestId(TID.embed.stepPill('products'))).toBeVisible();

    // Products load via /api/v1/products. Wait for the exact Mayor Clásica — Cruising card
    // (not Plus nor Racing — the name prefix is shared).
    const gvstdCard = page
      .getByText('Mayor Clásica — Cruising', { exact: true })
      .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');
    await gvstdCard.waitFor({ state: 'visible', timeout: 10_000 });
    await gvstdCard.click();

    // Step 3: configure pill active
    await expect(page.getByTestId(TID.embed.stepPill('configure'))).toBeVisible();

    // If "Número de rizos" is present, leave default or pick "2 rizos".
    const rizosSelect = page.locator('select').filter({ hasText: /rizos/i }).first();
    if (await rizosSelect.count()) {
      await rizosSelect.selectOption({ label: '2 rizos' }).catch(() => {});
    }

    await page.getByTestId(TID.embed.continueConfigure).click();

    // Step 4: preview pill active + sail SVG + features list
    await expect(page.getByTestId(TID.embed.stepPill('preview'))).toBeVisible();
    await expect(page.getByTestId(TID.embed.sailSvg)).toBeVisible();

    const features = page.getByTestId(TID.embed.featuresList).locator('li');
    const featureCount = await features.count();
    expect(featureCount).toBeGreaterThanOrEqual(5);

    await page.getByTestId(TID.embed.continuePreview).click();

    // Step 5: contact pill active
    await expect(page.getByTestId(TID.embed.stepPill('contact'))).toBeVisible();

    await page.getByPlaceholder('Tu nombre').fill('E2E Test');
    await page.getByPlaceholder('tu@email.com').fill(email);

    // Wait for the POST /api/v1/quotes response before asserting the UI.
    const quoteResponse = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/quotes') && res.request().method() === 'POST',
    );
    await page.getByTestId(TID.embed.submitQuote).click();
    const apiRes = await quoteResponse;
    if (!apiRes.ok()) {
      const body = await apiRes.text().catch(() => '<unreadable>');
      throw new Error(`POST /api/v1/quotes failed — status=${apiRes.status()} body=${body}`);
    }

    // Done screen
    await expect(page.getByText('Presupuesto solicitado')).toBeVisible({ timeout: 10_000 });

    // DB verification
    const rows = await dbQuery<{ id: string; status: string; customer_email: string }>(
      'SELECT id, status, customer_email FROM quotes WHERE customer_email = $1',
      [email],
    );
    expect(rows.length).toBe(1);
    expect(rows[0]!.status).toBe('draft');

    const items = await dbQuery<{ cost: string | null }>(
      'SELECT cost FROM quote_items WHERE quote_id = $1',
      [rows[0]!.id],
    );
    expect(items.length).toBeGreaterThan(0);
    // cost must be non-null and > 0 (server computed)
    expect(items[0]!.cost).not.toBeNull();
    expect(Number(items[0]!.cost)).toBeGreaterThan(0);
  });
});
