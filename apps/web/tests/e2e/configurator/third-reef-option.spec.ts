import { test, expect } from '@playwright/test';
import { TID } from '../fixtures/selectors';

/**
 * Spec 4 — Third reef option on gvstd/gvfull products.
 * - Mayor Clásica (gvstd) HAS "Número de rizos" with "2 rizos" / "3 rizos".
 * - "3 rizos" applies a +10% percentModifier to the total.
 * - Mayor Enrollable (gve) does NOT have the rizos field.
 * - The sail preview SVG draws N dashed horizontal reef lines matching the count.
 */

const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY;

async function readTotalFromBreakdown(page: import('@playwright/test').Page): Promise<number | null> {
  // The breakdown box in step 'configure' has "Total estimado" followed by a
  // big number span. Look for that label's sibling.
  const label = page.getByText('Total estimado', { exact: true }).first();
  if (!(await label.count())) return null;
  // Value is rendered adjacent; grab the parent row's last big span.
  const row = label.locator('xpath=..');
  const text = await row.innerText();
  // text looks like: "Total estimado\n1828 EUR"
  const m = text.match(/([\d][\d.,\s]*)\s*(?:EUR|€)?/g);
  if (!m) return null;
  // Pull the last numeric group
  const nums = text.replace(/[^\d\s]/g, ' ').trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
  return nums.length ? nums[nums.length - 1]! : null;
}

test.describe('configurator: third reef option', () => {
  test.skip(!DEMO_KEY, 'NEXT_PUBLIC_DEMO_API_KEY not set');

  test('gvstd exposes 2/3 rizos, gve does not; +10% applied; SVG reflects count', async ({ page }) => {
    await page.goto(`/embed?key=${DEMO_KEY}`);

    // Pick a boat (Bavaria 38 → gvstd default ~34.16 m²)
    await page.getByTestId(TID.embed.boatSearch).fill('Bavaria');
    const firstResult = page.getByTestId('embed-boat-result-0');
    await firstResult.waitFor({ state: 'visible', timeout: 10_000 });
    await firstResult.click();

    // Click Mayor Clásica — Cruising (gvstd)
    const gvstdCard = page
      .getByText('Mayor Clásica — Cruising', { exact: true })
      .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');
    await gvstdCard.waitFor({ state: 'visible', timeout: 10_000 });
    await gvstdCard.click();

    await expect(page.getByTestId(TID.embed.stepPill('configure'))).toBeVisible();

    // Assert the "Número de rizos" field exists, with 2 and 3 rizos options.
    const rizosLabel = page.getByText('Número de rizos', { exact: false });
    await expect(rizosLabel.first()).toBeVisible();
    const rizosSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: '3 rizos' }),
    }).first();
    await expect(rizosSelect).toBeVisible();

    // Select "2 rizos" first and capture the total.
    await rizosSelect.selectOption({ label: '2 rizos' });
    // Wait briefly for re-render
    await page.waitForTimeout(100);
    const totalTwo = await readTotalFromBreakdown(page);
    expect(totalTwo).not.toBeNull();
    expect(totalTwo!).toBeGreaterThan(0);

    // Now go back to products step and pick Mayor Enrollable — Cruising (gve).
    await page.getByTestId(TID.embed.stepPill('products')).click();

    const gveCard = page
      .getByText('Mayor Enrollable — Cruising', { exact: true })
      .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');
    await gveCard.click();

    await expect(page.getByTestId(TID.embed.stepPill('configure'))).toBeVisible();
    // Assert NO "Número de rizos" label in configure for gve.
    await expect(page.getByText('Número de rizos')).toHaveCount(0);

    // Back to products, re-select gvstd and pick "3 rizos".
    await page.getByTestId(TID.embed.stepPill('products')).click();
    await gvstdCard.waitFor({ state: 'visible' });
    await gvstdCard.click();
    await expect(page.getByTestId(TID.embed.stepPill('configure'))).toBeVisible();

    const rizosSelect2 = page.locator('select').filter({
      has: page.locator('option', { hasText: '3 rizos' }),
    }).first();
    await rizosSelect2.selectOption({ label: '3 rizos' });
    await page.waitForTimeout(100);
    const totalThree = await readTotalFromBreakdown(page);
    expect(totalThree).not.toBeNull();

    // 3 rizos ≈ 2 rizos × 1.10 (no flat modifier; purely +10% on subtotal).
    const expectedThree = totalTwo! * 1.10;
    // UI uses toFixed(0); allow a small rounding tolerance.
    expect(Math.abs(totalThree! - expectedThree)).toBeLessThanOrEqual(2);

    // Continue to preview
    await page.getByTestId(TID.embed.continueConfigure).click();
    await expect(page.getByTestId(TID.embed.stepPill('preview'))).toBeVisible();

    // config summary contains "3 rizos"
    const summary = page.getByTestId(TID.embed.configSummary);
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('3 rizos');

    // SVG has 3 reef lines (dashed horizontal <line> with strokeDasharray).
    const svg = page.getByTestId(TID.embed.sailSvg);
    await expect(svg).toBeVisible();

    const dashedLines3 = svg.locator('line[stroke-dasharray]');
    await expect(dashedLines3).toHaveCount(3);

    // Go back to configure and pick "2 rizos" → then back to preview → 2 lines.
    await page.getByTestId(TID.embed.stepPill('configure')).click();
    const rizosSelect3 = page.locator('select').filter({
      has: page.locator('option', { hasText: '3 rizos' }),
    }).first();
    await rizosSelect3.selectOption({ label: '2 rizos' });
    await page.getByTestId(TID.embed.continueConfigure).click();
    await expect(page.getByTestId(TID.embed.stepPill('preview'))).toBeVisible();

    const svg2 = page.getByTestId(TID.embed.sailSvg);
    const dashedLines2 = svg2.locator('line[stroke-dasharray]');
    await expect(dashedLines2).toHaveCount(2);
  });
});
