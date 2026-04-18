import { test, expect } from '@playwright/test';

test.describe('smoke: public routes', () => {
  test('GET / returns 200', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
  });
});
