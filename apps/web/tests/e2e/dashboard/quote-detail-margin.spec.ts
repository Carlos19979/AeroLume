/**
 * Spec 1: Quote detail margin analysis card
 *
 * Creates a quote via the public API (to exercise the server-side pricing
 * pipeline) for a Mayor Clásica Cruising sail with sailArea=25 m². The tier
 * 21-32 m² has cost=43.51 and msrp=60.92 per m² -> unitPrice=1523, cost=1087.75.
 * Then navigates to the dashboard quote detail page after logging in as the
 * tenant owner, and verifies the "Análisis de margen" card shows the correct
 * PVP / Coste / Margen / percentage values.
 */
import { test, expect } from '../fixtures/auth';
import { apiClient, dbQuery } from '../fixtures/api';
import { TID } from '../fixtures/selectors';
import type { Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/ }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 15_000 });
}

test.describe('dashboard: quote detail margin card', () => {
  test('shows correct PVP / Coste / Margen for sailArea=25 on Mayor Clásica Cruising', async ({
    page,
    tenant,
    baseURL,
  }) => {
    // 1) Resolve the cloned product for this tenant.
    const productRows = await dbQuery<{ id: string }>(
      `SELECT id FROM products
       WHERE tenant_id = $1 AND sail_type = 'gvstd' AND variant = 'cruising'
       LIMIT 1`,
      [tenant.tenantId],
    );
    expect(productRows.length).toBe(1);
    const productId = productRows[0].id;

    // 2) Create the quote through the public API (server computes price + cost).
    const api = apiClient(baseURL!, tenant.apiKey);
    const { status, body } = await api.post<{ data: { id: string; status: string } }>(
      '/api/v1/quotes',
      {
        boatModel: 'E2E Margin Test',
        customerName: 'E2E',
        customerEmail: 'e2e-margin@aerolume.test',
        items: [
          {
            productId,
            sailType: 'gvstd',
            productName: 'Mayor Clásica Cruising',
            sailArea: '25',
            quantity: 1,
            configuration: {},
          },
        ],
      },
    );
    expect(status).toBe(200);
    const quoteId = body?.data?.id;
    expect(quoteId).toBeTruthy();

    // Sanity-check what the server stored so we know the UI math has valid inputs.
    const itemRows = await dbQuery<{ unit_price: string; cost: string }>(
      `SELECT unit_price, cost FROM quote_items WHERE quote_id = $1`,
      [quoteId],
    );
    expect(itemRows.length).toBe(1);
    expect(Math.abs(Number(itemRows[0].unit_price) - 1523)).toBeLessThan(1);
    expect(Math.abs(Number(itemRows[0].cost) - 1087.75)).toBeLessThan(1);

    // 3) Log in as the tenant owner.
    await loginAs(page, tenant.email, tenant.password);

    // 4) Navigate to the quote detail page.
    await page.goto(`/dashboard/quotes/${quoteId}`);

    // 5) Assert the margin card values. The UI uses toLocaleString('es-ES',
    //    { minimumFractionDigits: 0, maximumFractionDigits: 0 }) which renders
    //    "1.523" (dot as thousands separator) for 1523.
    const pvp = page.getByTestId(TID.quote.marginPvp);
    const cost = page.getByTestId(TID.quote.marginCost);
    const result = page.getByTestId(TID.quote.marginResult);
    const percent = page.getByTestId(TID.quote.marginPercent);

    await expect(pvp).toBeVisible();
    // 1523 -> "1.523" or "1523". We accept either for robustness.
    await expect(pvp).toContainText(/1[.\s]?523/);
    // 1087.75 rounds to 1088 -> "1.088"
    await expect(cost).toContainText(/1[.\s]?088/);
    // 435.25 rounds to 435
    await expect(result).toContainText(/435/);
    // 28.58% -> toFixed(1) = "28.6"
    await expect(percent).toContainText(/28\.6/);
  });
});
