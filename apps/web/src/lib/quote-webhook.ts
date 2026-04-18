import { db, tenants, eq } from '@aerolume/db';
import { isInternalUrl } from '@/lib/url-validation';

export interface QuoteWebhookItem {
  productId: string | null;
  sailType: string;
  productName: string;
  sailArea: string | null;
  quantity: number | null;
  unitPrice: string | null;
  configuration: Record<string, unknown>;
}

export interface QuoteWebhookPayload {
  id: string;
  status: string;
  boatModel: string | null;
  boatLength: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerNotes: string | null;
  currency: string | null;
  totalPrice?: string | null;
  items: QuoteWebhookItem[];
  createdAt: Date | null;
  updatedAt?: Date | null;
}

/**
 * Dispatches a quote event webhook to the tenant's configured webhookUrl.
 *
 * Fire-and-forget: call without `await` and chain `.catch(() => {})`.
 * - Payload never includes `cost` (internal supplier data).
 * - `redirect: 'manual'` defends against redirect-based SSRF.
 * - Skipped if webhookUrl is absent or matches internal IP patterns.
 */
export async function dispatchQuoteWebhook(
  tenantId: string,
  event: string,
  quote: QuoteWebhookPayload,
): Promise<void> {
  let webhookUrl: string | null = null;

  try {
    const [tenant] = await db
      .select({ webhookUrl: tenants.webhookUrl })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    webhookUrl = tenant?.webhookUrl ?? null;
  } catch (err) {
    console.error('[quote-webhook] Failed to fetch tenant webhookUrl:', err);
    return;
  }

  if (!webhookUrl || isInternalUrl(webhookUrl)) return;

  const body = JSON.stringify({
    event,
    data: {
      id: quote.id,
      status: quote.status,
      boatModel: quote.boatModel,
      boatLength: quote.boatLength,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerPhone: quote.customerPhone,
      customerNotes: quote.customerNotes,
      currency: quote.currency,
      ...(quote.totalPrice !== undefined ? { totalPrice: quote.totalPrice } : {}),
      items: quote.items.map((i) => ({
        productId: i.productId,
        sailType: i.sailType,
        productName: i.productName,
        sailArea: i.sailArea,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        configuration: i.configuration,
        // NOTE: `cost` intentionally omitted — internal supplier data only
      })),
      createdAt: quote.createdAt,
      ...(quote.updatedAt !== undefined ? { updatedAt: quote.updatedAt } : {}),
    },
  });

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'manual',
    body,
  }).catch((err) => {
    console.error(`[quote-webhook] Failed to deliver event "${event}" to ${webhookUrl}:`, err);
  });
}
