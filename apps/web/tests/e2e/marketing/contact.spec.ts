import { test, expect } from '@playwright/test';

test.describe('marketing: contact page (/contact)', () => {
  test('GET /contact returns 200', async ({ request }) => {
    const res = await request.get('/contact');
    expect(res.status()).toBe(200);
  });

  test('page loads without uncaught JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('form fields are present (nombre, email, asunto, mensaje)', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });

  test('submit button is present', async ({ page }) => {
    await page.goto('/contact');
    const btn = page.getByRole('button', { name: /enviar mensaje/i });
    await expect(btn).toBeVisible();
  });

  test('submit with valid data shows success state', async ({ page }) => {
    // ContactContent handles submission client-side (no API call):
    // handleSubmit just sets submitted=true, showing "Mensaje enviado".
    await page.goto('/contact');
    await page.fill('#name', 'Carlos Test');
    await page.fill('#email', 'carlos@test.com');
    await page.fill('#subject', 'Test subject');
    await page.fill('#message', 'Test message body');
    await page.getByRole('button', { name: /enviar mensaje/i }).click();
    await expect(page.getByText('Mensaje enviado')).toBeVisible();
    await expect(page.getByText('Gracias por contactarnos')).toBeVisible();
  });

  test('success state has "Enviar otro mensaje" button that resets the form', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#name', 'Carlos Test');
    await page.fill('#email', 'carlos@test.com');
    await page.fill('#subject', 'Reset test');
    await page.fill('#message', 'Body');
    await page.getByRole('button', { name: /enviar mensaje/i }).click();
    await expect(page.getByText('Mensaje enviado')).toBeVisible();
    await page.getByRole('button', { name: /enviar otro mensaje/i }).click();
    // Form should be back
    await expect(page.locator('#name')).toBeVisible();
  });

  test('empty submit: form fields have no required attr so submit passes — success state shown', async ({ page }) => {
    // ContactContent fields are not marked `required`, so submitting empty
    // goes straight to success state. This test documents that behaviour.
    await page.goto('/contact');
    await page.getByRole('button', { name: /enviar mensaje/i }).click();
    await expect(page.getByText('Mensaje enviado')).toBeVisible();
  });
});
