import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, quotes, quoteItems } from '@aerolume/db';

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  const [quote] = await db
    .insert(quotes)
    .values({
      tenantId: auth.ctx.tenantId,
      boatId: body.boatId || null,
      boatModel: body.boatModel || null,
      boatLength: body.boatLength || null,
      status: 'draft',
      customerName: body.customerName || null,
      customerEmail: body.customerEmail || null,
      customerPhone: body.customerPhone || null,
      customerNotes: body.customerNotes || null,
      currency: body.currency || 'EUR',
    })
    .returning();

  if (body.items && Array.isArray(body.items)) {
    const itemValues = body.items.map((item: any, idx: number) => ({
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

    await db.insert(quoteItems).values(itemValues);
  }

  return NextResponse.json({ data: { id: quote.id, status: quote.status } });
}
