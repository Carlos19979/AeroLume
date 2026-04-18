import { test, expect } from '@playwright/test';

test.describe('marketing: about page (/about)', () => {
  test('GET /about returns 200', async ({ request }) => {
    const res = await request.get('/about');
    expect(res.status()).toBe(200);
  });

  test('page loads without uncaught JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('h1 contains company-identifying copy', async ({ page }) => {
    await page.goto('/about');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    // Stable copy from AboutContent: "Tecnologia nautica"
    await expect(h1).toContainText('Tecnologia nautica');
  });

  test('values section "Tres principios" heading is visible', async ({ page }) => {
    await page.goto('/about');
    const heading = page.getByRole('heading', { name: /tres principios/i });
    await expect(heading).toBeVisible();
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/about');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
