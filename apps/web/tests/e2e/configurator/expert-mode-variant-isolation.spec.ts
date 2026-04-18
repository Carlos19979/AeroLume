import { test, expect } from '@playwright/test';
import { TID } from '../fixtures/selectors';

/**
 * Spec 2 — Regression: customAreas used to be keyed by sailType so editing
 * one variant mutated the others. It's now keyed by productId.
 */

const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY;

test.describe('configurator: expert-mode variant isolation', () => {
  test.skip(!DEMO_KEY, 'NEXT_PUBLIC_DEMO_API_KEY not set');

  test('editing one gve variant does not mutate the others', async ({ page }) => {
    await page.goto(`/embed?key=${DEMO_KEY}`);

    await page.getByTestId(TID.embed.boatSearch).fill('Bavaria');
    const firstResult = page.getByTestId('embed-boat-result-0');
    await firstResult.waitFor({ state: 'visible', timeout: 10_000 });
    await firstResult.click();

    // Enter expert mode
    await page.getByTestId(TID.embed.expertToggle).click();

    // Locate the 3 Mayor Enrollable cards (gve). The base "Cruising" variant
    // shares a prefix with "Cruising Plus" / "Cruising Racing", so we resolve
    // each card by finding the <p> element whose exact text is the product name.
    const cruisingCard = page
      .getByText('Mayor Enrollable — Cruising', { exact: true })
      .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');
    const plusCard = page
      .getByText('Mayor Enrollable — Cruising Plus', { exact: true })
      .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');
    const racingCard = page
      .getByText('Mayor Enrollable — Cruising Racing', { exact: true })
      .locator('xpath=ancestor::*[starts-with(@data-testid, "embed-product-card-")][1]');

    await expect(cruisingCard).toHaveCount(1);
    await expect(plusCard).toHaveCount(1);
    await expect(racingCard).toHaveCount(1);

    const extractId = async (card: ReturnType<typeof page.locator>) => {
      const tid = await card.getAttribute('data-testid');
      if (!tid) throw new Error('Missing data-testid on product card');
      return tid.replace('embed-product-card-', '');
    };

    const cruisingId = await extractId(cruisingCard);
    const plusId = await extractId(plusCard);
    const racingId = await extractId(racingCard);

    expect(cruisingId).not.toBe(plusId);
    expect(plusId).not.toBe(racingId);

    const cruisingInput = page.getByTestId(TID.embed.customArea(cruisingId));
    const plusInput = page.getByTestId(TID.embed.customArea(plusId));
    const racingInput = page.getByTestId(TID.embed.customArea(racingId));

    // Edit cruising → 40
    await cruisingInput.fill('40');
    await expect(cruisingInput).toHaveValue('40');

    // Plus and Racing still empty
    await expect(plusInput).toHaveValue('');
    await expect(racingInput).toHaveValue('');

    // Edit plus → 60
    await plusInput.fill('60');
    await expect(plusInput).toHaveValue('60');

    // Cruising still 40 (not overwritten), Racing still empty
    await expect(cruisingInput).toHaveValue('40');
    await expect(racingInput).toHaveValue('');

    // Click plus card → configure step → the header shows the custom area (60).
    await plusCard.click();
    await expect(page.getByTestId(TID.embed.stepPill('configure'))).toBeVisible();

    // The configure header renders "Superficie personalizada: 60.00 m²"
    await expect(page.getByText(/Superficie personalizada: 60[.,]00 m²/)).toBeVisible();
  });
});
