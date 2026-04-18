import { NextResponse } from 'next/server';
import { db, quotes, quoteItems, eq, and } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { validateBody, updateQuoteSchema } from '@/lib/validations';
import { dispatchQuoteWebhook } from '@/lib/quote-webhook';

export const GET = withTenantAuth(async (_request, { tenant }, params) => {
  const { id } = params;

  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)))
    .limit(1);

  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id));

  return NextResponse.json({ data: { ...quote, items } });
});

export const PUT = withTenantAuth(async (request, { tenant }, params) => {
  const { id } = params;
  const body = await request.json();
  const validation = validateBody(updateQuoteSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [updated] = await db
    .update(quotes)
    .set({
      status: data.status,
      totalPrice: data.totalPrice,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerNotes: data.customerNotes,
      updatedAt: new Date(),
    })
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Determine event name: status changes get a dedicated event for easier webhook filtering
  const event = data.status ? 'quote.status_changed' : 'quote.updated';

  // Fetch items for webhook payload (fire and forget — do not block response)
  db.select().from(quoteItems).where(eq(quoteItems.quoteId, id))
    .then((items) =>
      dispatchQuoteWebhook(tenant.id, event, {
        id: updated.id,
        status: updated.status,
        boatModel: updated.boatModel,
        boatLength: updated.boatLength,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        customerPhone: updated.customerPhone,
        customerNotes: updated.customerNotes,
        currency: updated.currency,
        totalPrice: updated.totalPrice,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt ?? undefined,
        items: items.map((i) => ({
          productId: i.productId,
          sailType: i.sailType,
          productName: i.productName,
          sailArea: i.sailArea,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          configuration: i.configuration as Record<string, unknown>,
        })),
      })
    )
    .catch((err) => console.error('[quote-webhook] PUT dispatch error:', err));

  return NextResponse.json({ data: updated });
});

export const DELETE = withTenantAuth(async (_request, { tenant }, params) => {
  const { id } = params;

  // Fetch quote before deleting so we can include it in the webhook payload
  const [toDelete] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)))
    .limit(1);

  await db
    .delete(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)));

  if (toDelete) {
    dispatchQuoteWebhook(tenant.id, 'quote.deleted', {
      id: toDelete.id,
      status: toDelete.status,
      boatModel: toDelete.boatModel,
      boatLength: toDelete.boatLength,
      customerName: toDelete.customerName,
      customerEmail: toDelete.customerEmail,
      customerPhone: toDelete.customerPhone,
      customerNotes: toDelete.customerNotes,
      currency: toDelete.currency,
      totalPrice: toDelete.totalPrice,
      createdAt: toDelete.createdAt,
      updatedAt: toDelete.updatedAt ?? undefined,
      items: [],
    }).catch((err) => console.error('[quote-webhook] DELETE dispatch error:', err));
  }

  return NextResponse.json({ data: { deleted: true } });
});
