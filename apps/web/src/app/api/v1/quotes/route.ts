import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, quotes, quoteItems, tenants, eq } from '@aerolume/db';
import { isInternalUrl } from '@/lib/url-validation';
import { withCors } from '@/lib/cors';
import { validateBody, createQuoteSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const validation = validateBody(createQuoteSchema, body);
  if ('error' in validation) {
    const origin = request.headers.get('origin');
    return withCors(NextResponse.json({ error: validation.error }, { status: 400 }), origin);
  }
  const data = validation.data;

  const [quote] = await db
    .insert(quotes)
    .values({
      tenantId: auth.ctx.tenantId,
      boatId: data.boatId || null,
      boatModel: data.boatModel || null,
      boatLength: data.boatLength || null,
      status: 'draft',
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      customerNotes: data.customerNotes || null,
      currency: data.currency,
    })
    .returning();

  let items: any[] = [];
  if (data.items && Array.isArray(data.items)) {
    const itemValues = data.items.map((item: any, idx: number) => ({
      quoteId: quote.id,
      productId: item.productId || null,
      sailType: item.sailType || 'unknown',
      productName: item.productName || 'Unknown',
      sailArea: item.sailArea || null,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || null,
      configuration: item.configuration || {},
      sortOrder: idx,
    }));

    items = await db.insert(quoteItems).values(itemValues).returning();
  }

  // Send webhook notification (fire and forget)
  const [tenant] = await db
    .select({ webhookUrl: tenants.webhookUrl })
    .from(tenants)
    .where(eq(tenants.id, auth.ctx.tenantId))
    .limit(1);

  if (tenant?.webhookUrl && !isInternalUrl(tenant.webhookUrl)) {
    fetch(tenant.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'quote.created',
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
          items: items.map((i) => ({
            sailType: i.sailType,
            productName: i.productName,
            sailArea: i.sailArea,
            unitPrice: i.unitPrice,
            configuration: i.configuration,
          })),
          createdAt: quote.createdAt,
        },
      }),
    }).catch(() => {});
  }

  const origin = request.headers.get('origin');
  return withCors(NextResponse.json({ data: { id: quote.id, status: quote.status } }), origin);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}
