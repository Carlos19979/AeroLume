import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .limit(1);

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const fields = await db
    .select()
    .from(productConfigFields)
    .where(eq(productConfigFields.productId, id));

  return NextResponse.json({ data: { ...product, configFields: fields } });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const body = await request.json();

  const [updated] = await db
    .update(products)
    .set({
      name: body.name,
      sailType: body.sailType,
      basePrice: body.basePrice,
      currency: body.currency,
      descriptionShort: body.descriptionShort,
      descriptionFull: body.descriptionFull,
      active: body.active,
      sortOrder: body.sortOrder,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)));

  return NextResponse.json({ data: { deleted: true } });
}
