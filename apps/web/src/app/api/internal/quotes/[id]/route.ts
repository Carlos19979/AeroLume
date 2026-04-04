import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, quotes, quoteItems, eq, and } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

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
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const body = await request.json();

  const [updated] = await db
    .update(quotes)
    .set({
      status: body.status,
      totalPrice: body.totalPrice,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerNotes: body.customerNotes,
      updatedAt: new Date(),
    })
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  await db
    .delete(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)));

  return NextResponse.json({ data: { deleted: true } });
}
