import { NextResponse } from 'next/server';
import { db, quotes, quoteItems, eq, and } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { validateBody, updateQuoteSchema } from '@/lib/validations';

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

  return NextResponse.json({ data: updated });
});

export const DELETE = withTenantAuth(async (_request, { tenant }, params) => {
  const { id } = params;

  await db
    .delete(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)));

  return NextResponse.json({ data: { deleted: true } });
});
