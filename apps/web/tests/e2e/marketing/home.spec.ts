import { test, expect } from '@playwright/test';

test.describe('marketing: home page (/)', () => {
  test('GET / returns 200', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
  });

  test('page loads without uncaught JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('Hero heading is visible', async ({ page }) => {
    await page.goto('/');
    // Use the section landmark to scope to the Hero's h1 (the widget mockup also has an h1)
    const heroH1 = page.locator('section').first().locator('h1');
    await expect(heroH1).toBeVisible();
    await expect(heroH1).toContainText('configurador de velas');
  });

  test('primary CTA "Prueba el configurador" is visible and links to /#configurador', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /prueba el configurador/i });
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toMatch(/#configurador/);
  });

  test('FAQ: clicking first item expands its answer', async ({ page }) => {
    await page.goto('/');
    // FAQ buttons have aria-controls="faq-answer-N" — use that to scope precisely
    const firstFaqBtn = page.locator('button[aria-controls^="faq-answer-"]').first();
    await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'false');
    await firstFaqBtn.click();
    await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');
    const answerId = await firstFaqBtn.getAttribute('aria-controls');
    if (answerId) {
      await expect(page.locator(`#${answerId}`)).toBeVisible();
    }
  });

  test('responsive smoke: Hero visible at 375px mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // Scope to first section (Hero) to avoid strict-mode collision with widget mockup h1
    const heroH1 = page.locator('section').first().locator('h1');
    await expect(heroH1).toBeVisible();
  });
});
