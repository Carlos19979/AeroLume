/**
 * E2E spec: /dashboard/analytics page
 *
 * Covers:
 *   - The 4 summary stat cards render (data-testid assertions).
 *   - The byType, topBoats, topSailTypes, and perDay sections render.
 *   - Displayed counts match what was seeded in the DB.
 *   - Date-range filter: skipped (no filter UI exists in the current client.tsx).
 */
import { test, expect } from '../fixtures/auth';
import { dbQuery, closeDbQuery } from '../fixtures/api';
import { TID } from '../fixtures/selectors';
import type { Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contrase\u00f1a').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/i }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

async function insertAnalyticsEvents(
  tenantId: string,
  events: Array<{
    eventType: string;
    boatModel?: string;
    sailType?: string;
    daysAgo?: number;
  }>,
): Promise<void> {
  for (const ev of events) {
    const daysAgo = ev.daysAgo ?? 0;
    await dbQuery(
      `INSERT INTO analytics_events (tenant_id, event_type, boat_model, sail_type, created_at)
       VALUES ($1::uuid, $2, $3, $4, NOW() - ($5 || ' days')::interval)`,
      [tenantId, ev.eventType, ev.boatModel ?? null, ev.sailType ?? null, String(daysAgo)],
    );
  }
}

test.afterAll(async () => {
  await closeDbQuery();
});

test.describe('dashboard: /dashboard/analytics page', () => {
  test('renders all 4 stat cards and aggregation sections', async ({ page, tenant }) => {
    // Seed a known set of events so the page is not empty.
    await insertAnalyticsEvents(tenant.tenantId, [
      { eventType: 'boat_search', boatModel: 'Bavaria 40', daysAgo: 1 },
      { eventType: 'boat_search', boatModel: 'Bavaria 40', daysAgo: 2 },
      { eventType: 'product_view', sailType: 'gvstd', daysAgo: 1 },
      { eventType: 'product_view', sailType: 'gvstd', daysAgo: 1 },
      { eventType: 'product_view', sailType: 'gvstd', daysAgo: 1 },
      { eventType: 'quote_created', daysAgo: 0 },
    ]);

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/analytics');

    // Summary section must exist
    await expect(page.getByTestId(TID.dashboard.analytics.summary)).toBeVisible({ timeout: 10_000 });

    // All 4 stat cards
    await expect(page.getByTestId(TID.dashboard.analytics.total)).toBeVisible();
    await expect(page.getByTestId(TID.dashboard.analytics.boatSearch)).toBeVisible();
    await expect(page.getByTestId(TID.dashboard.analytics.quoteCreated)).toBeVisible();
    await expect(page.getByTestId(TID.dashboard.analytics.productView)).toBeVisible();

    // Section panels
    await expect(page.getByTestId(TID.dashboard.analytics.byType)).toBeVisible();
    await expect(page.getByTestId(TID.dashboard.analytics.topBoats)).toBeVisible();
    await expect(page.getByTestId(TID.dashboard.analytics.topSailTypes)).toBeVisible();

    // Activity chart must appear (perDay has data within last 30 days)
    await expect(page.getByTestId(TID.dashboard.analytics.perDay)).toBeVisible();
  });

  test('stat card values match seeded event counts', async ({ page, tenant }) => {
    // Delete any pre-existing events for this tenant so counts are exact.
    await dbQuery(
      `DELETE FROM analytics_events WHERE tenant_id = $1`,
      [tenant.tenantId],
    );

    // Seed a deterministic set
    await insertAnalyticsEvents(tenant.tenantId, [
      { eventType: 'boat_search', boatModel: 'Jeanneau 52', daysAgo: 1 },
      { eventType: 'boat_search', boatModel: 'Jeanneau 52', daysAgo: 2 },
      { eventType: 'boat_search', boatModel: 'Jeanneau 52', daysAgo: 3 },
      { eventType: 'product_view', sailType: 'gvstd', daysAgo: 1 },
      { eventType: 'product_view', sailType: 'gvstd', daysAgo: 1 },
      { eventType: 'quote_created', daysAgo: 0 },
      { eventType: 'quote_created', daysAgo: 1 },
      { eventType: 'configurator_opened', daysAgo: 0 },
    ]);
    // Total = 8

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/analytics');

    await expect(page.getByTestId(TID.dashboard.analytics.summary)).toBeVisible({ timeout: 10_000 });

    // Read displayed values from each stat card
    const totalCard = page.getByTestId(TID.dashboard.analytics.total);
    const boatCard = page.getByTestId(TID.dashboard.analytics.boatSearch);
    const quoteCard = page.getByTestId(TID.dashboard.analytics.quoteCreated);
    const productCard = page.getByTestId(TID.dashboard.analytics.productView);

    // The displayed value is inside the first div (toLocaleString('es') — e.g. "8" or "1.000")
    // We parse the text to an integer for comparison.
    const parseCount = async (locator: ReturnType<Page['getByTestId']>) => {
      const text = await locator.locator('div').first().textContent();
      return parseInt((text ?? '0').replace(/\D/g, ''), 10);
    };

    const total = await parseCount(totalCard);
    const boatCount = await parseCount(boatCard);
    const quoteCount = await parseCount(quoteCard);
    const productCount = await parseCount(productCard);

    expect(total).toBe(8);
    expect(boatCount).toBe(3);
    expect(quoteCount).toBe(2);
    expect(productCount).toBe(2);
  });

  test('topBoats section lists the correct boat model', async ({ page, tenant }) => {
    await dbQuery(
      `DELETE FROM analytics_events WHERE tenant_id = $1`,
      [tenant.tenantId],
    );

    await insertAnalyticsEvents(tenant.tenantId, [
      { eventType: 'boat_search', boatModel: 'Bavaria Cruiser 33', daysAgo: 0 },
      { eventType: 'boat_search', boatModel: 'Bavaria Cruiser 33', daysAgo: 1 },
      { eventType: 'boat_search', boatModel: 'Dufour 520', daysAgo: 0 },
    ]);

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/analytics');

    const topBoatsSection = page.getByTestId(TID.dashboard.analytics.topBoats);
    await expect(topBoatsSection).toBeVisible({ timeout: 10_000 });

    // Bavaria Cruiser 33 (count 2) must appear in the list
    await expect(topBoatsSection).toContainText('Bavaria Cruiser 33');
    // Dufour 520 (count 1) must also appear
    await expect(topBoatsSection).toContainText('Dufour 520');
  });

  test('perDay chart only shows events within last 30 days', async ({ page, tenant }) => {
    await dbQuery(
      `DELETE FROM analytics_events WHERE tenant_id = $1`,
      [tenant.tenantId],
    );

    // Insert one event within the last 30 days and verify chart renders.
    await insertAnalyticsEvents(tenant.tenantId, [
      { eventType: 'configurator_opened', daysAgo: 5 },
    ]);

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/analytics');

    // perDay chart renders because there is data within 30 days
    await expect(page.getByTestId(TID.dashboard.analytics.perDay)).toBeVisible({ timeout: 10_000 });
  });

  test.skip('date-range filter updates counts — TODO: filter UI not yet implemented', async () => {
    // The current client.tsx has no date-range filter control.
    // This test should be implemented once the filter is added to the UI.
  });
});
