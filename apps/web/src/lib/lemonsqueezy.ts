import { createHmac, timingSafeEqual } from 'crypto';

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1';

function getHeaders() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY not set');
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };
}

export async function createCheckoutUrl(tenantId: string, tenantEmail: string): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!storeId || !variantId) throw new Error('LemonSqueezy store/variant not configured');

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: tenantEmail,
            custom: { tenant_id: tenantId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LemonSqueezy checkout failed: ${err}`);
  }

  const json = await res.json();
  return json.data.attributes.url;
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET not set');

  const hmac = createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
