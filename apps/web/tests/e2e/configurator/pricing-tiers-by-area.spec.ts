import { test, expect } from '@playwright/test';
import { TID } from '../fixtures/selectors';

/**
 * Spec 3 — Pricing tiers applied by surface area.
 * Uses expert mode to control the area input directly, then reads the
 * estimated price rendered in the product card.
 *
 * Catalog (seed.ts): gvstd Cruising MSRP/m² by tier:
 *   [10-20]=61.07  [21-32]=60.92  [33-45]=61.37  [46-60]=62.92  [61-70]=65.77
 *   basePrice = avg(msrps) = 62.41 (fallback for out-of-range areas)
 */

const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY;

const CASES = [
  { area: 15, tier: '10-20', expected: 15 * 61.07 },   // 916.05 → "916"
  { area: 30, tier: '21-32', expected: 30 * 60.92 },   // 1827.60 → "1828"
  { area: 70, tier: '61-70', expected: 70 * 65.77 },   // 4603.90 → "4604"
  { area: 200, tier: 'fallback', expected: 200 * 62.41 }, // 12482.00 → "12482"
];

test.describe('configurator: pricing tiers by area', () => {
  test.skip(!DEMO_KEY, 'NEXT_PUBLIC_DEMO_API_KEY not set');
  test.describe.configure({ mode: 'serial' });

  for (const { area, tier, expected } of CASES) {
    test(`area ${area} m² → tier ${tier} → ~${Math.round(expected)} €`, async ({ page }) => {
      await page.goto(`/embed?key=${DEMO_KEY}`);

      await page.getByTestId(TID.embed.boatSearch).fill('Bavaria');
      const firstResult = page.getByTestId('embed-boat-result-0');
      await firstResult.waitFor({ state: 'visible', timeout: 10_000 });
      await firstResult.click();

      // Enter expert mode
      await page.getByTestId(TID.embed.expertToggle).click();

      // Locate the Mayor Clásica — Cruising (gvstd) card by exact product name.
      const card = page
        .getByText('Mayor Clásica — Cruising', { exact: true })
        .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');
      await card.waitFor({ state: 'visible', timeout: 10_000 });

      // Extract productId from the data-testid
      const tid = await card.getAttribute('data-testid');
      expect(tid).not.toBeNull();
      const productId = tid!.replace('embed-product-card-', '');

      // Fill the custom area input for this card
      const input = page.getByTestId(TID.embed.customArea(productId));
      await input.fill(String(area));

      // The price rendered in the card is `toFixed(0)` of estimatedPrice.
      // Tolerate ±2 to cover rounding/display race conditions.
      const expectedInt = Math.round(expected);

      // The price text is inside the card's right-aligned column.
      // Read the text of the <p class="... font-bold ...">{estimated.toFixed(0)}<span>EUR</span></p>
      const priceEl = card.locator('p.font-bold').first();
      await expect(priceEl).toBeVisible();

      // Poll until the price stabilises (React may update on next tick).
      await expect
        .poll(
          async () => {
            const raw = (await priceEl.innerText()).replace(/[^\d]/g, '');
            const n = Number(raw);
            return isNaN(n) ? -1 : n;
          },
          { timeout: 5_000, intervals: [100, 200, 400] },
        )
        .toBeGreaterThan(0);

      const shownRaw = (await priceEl.innerText()).replace(/[^\d]/g, '');
      const shown = Number(shownRaw);
      expect(Math.abs(shown - expectedInt)).toBeLessThanOrEqual(2);
    });
  }
});
