/**
 * Sprint 2 – quotes-crud.spec.ts
 *
 * Quotes are created via the public API / embed widget — not from the dashboard.
 * This spec covers dashboard-side mutations only:
 *   • Change status (draft → sent → accepted) via the list page action buttons.
 *   • Delete a quote and verify cascade to quote_items.
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery, closeDbQuery } from '../fixtures/api';
import { CRUD } from '../fixtures/selectors';
import type { Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/i }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

/** Create a quote via the public API and return its id */
async function createQuote(apiKey: string, customerName: string, tenantId: string): Promise<string> {
  // Fetch a product ID from this tenant to satisfy .min(1) items requirement
  const [product] = await dbQuery<{ id: string; name: string; sail_type: string }>(
    `SELECT id, name, sail_type FROM products WHERE tenant_id = $1 LIMIT 1`,
    [tenantId],
  );
  if (!product) throw new Error('No products found for tenant');

  const client = apiClient(BASE_URL, apiKey);
  const res = await client.post<{ data: { id: string } }>('/api/v1/quotes', {
    boatModel: 'Bavaria 37',
    boatLength: 11.2,
    customerName,
    customerEmail: 'e2e@test.com',
    currency: 'EUR',
    items: [
      {
        productId: product.id,
        sailType: product.sail_type,
        productName: product.name,
        sailArea: 25,
        quantity: 1,
      },
    ],
  });
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Failed to create quote: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const body = res.body as { data?: { id: string }; error?: string };
  if (!body.data?.id) {
    throw new Error(`Quote creation failed: ${JSON.stringify(body)}`);
  }
  return body.data.id;
}

test.afterAll(async () => {
  await closeDbQuery();
});

test.describe('dashboard: quotes CRUD', () => {
  test('status change draft → sent → accepted updates DB', async ({ page, tenant }) => {
    const quoteId = await createQuote(tenant.apiKey, `E2E Customer ${Date.now()}`, tenant.tenantId);

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/quotes');

    // The row should exist
    await expect(page.locator(`[data-testid="quote-row-${quoteId}"]`)).toBeVisible();

    // Step 1: draft → sent
    await page.getByTestId(CRUD.quote.sendBtn(quoteId)).click();

    // UI: "Enviar" button disappears, "Aceptar" appears
    await expect(page.getByTestId(CRUD.quote.sendBtn(quoteId))).not.toBeVisible();
    await expect(page.getByTestId(CRUD.quote.acceptBtn(quoteId))).toBeVisible();

    // DB: status = sent
    const [afterSent] = await dbQuery<{ status: string }>(
      `SELECT status FROM quotes WHERE id = $1`,
      [quoteId],
    );
    expect(afterSent.status).toBe('sent');

    // Step 2: sent → accepted
    await page.getByTestId(CRUD.quote.acceptBtn(quoteId)).click();

    // UI: "Aceptar" disappears (no further action buttons for accepted)
    await expect(page.getByTestId(CRUD.quote.acceptBtn(quoteId))).not.toBeVisible();

    // DB: status = accepted
    const [afterAccepted] = await dbQuery<{ status: string }>(
      `SELECT status FROM quotes WHERE id = $1`,
      [quoteId],
    );
    expect(afterAccepted.status).toBe('accepted');
  });

  test('delete – quote row disappears and quote_items cascade', async ({ page, tenant }) => {
    // Create quote via API with an item so we can test cascade
    const client = apiClient(BASE_URL, tenant.apiKey);

    const [product] = await dbQuery<{ id: string; name: string; sail_type: string }>(
      `SELECT id, name, sail_type FROM products WHERE tenant_id = $1 LIMIT 1`,
      [tenant.tenantId],
    );
    if (!product) throw new Error('No products found for tenant');

    const res = await client.post<{ data: { id: string } }>('/api/v1/quotes', {
      boatModel: 'Beneteau 40',
      boatLength: 12.0,
      customerName: `Delete Test ${Date.now()}`,
      currency: 'EUR',
      items: [
        {
          productId: product.id,
          sailType: product.sail_type,
          productName: product.name,
          sailArea: 30,
          quantity: 1,
        },
      ],
    });
    const body = res.body as { data?: { id: string }; error?: string };
    if (!body.data?.id) throw new Error(`Failed to create quote: ${JSON.stringify(body)}`);
    const quoteId = body.data.id;

    await loginAs(page, tenant.email, tenant.password);
    await page.goto('/dashboard/quotes');

    await expect(page.locator(`[data-testid="quote-row-${quoteId}"]`)).toBeVisible();

    // Accept dialog then delete
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId(CRUD.quote.deleteBtn(quoteId)).click();

    // Row gone from UI
    await expect(page.locator(`[data-testid="quote-row-${quoteId}"]`)).not.toBeVisible();

    // DB: quote deleted
    const quotesAfter = await dbQuery<{ id: string }>(
      `SELECT id FROM quotes WHERE id = $1`,
      [quoteId],
    );
    expect(quotesAfter).toHaveLength(0);

    // DB: cascade – quote_items also gone
    const itemsAfter = await dbQuery<{ id: string }>(
      `SELECT id FROM quote_items WHERE quote_id = $1`,
      [quoteId],
    );
    expect(itemsAfter).toHaveLength(0);
  });
});
