import { NextResponse } from 'next/server';
import { db, quotes, eq, desc } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';

export const GET = withTenantAuth(async (_request, { tenant }) => {
  const list = await db
    .select({
      id: quotes.id,
      boatModel: quotes.boatModel,
      boatLength: quotes.boatLength,
      status: quotes.status,
      customerName: quotes.customerName,
      customerEmail: quotes.customerEmail,
      totalPrice: quotes.totalPrice,
      currency: quotes.currency,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .where(eq(quotes.tenantId, tenant.id))
    .orderBy(desc(quotes.createdAt));

  return NextResponse.json({ data: list });
});
