import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, quotes, eq, desc } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

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
}
