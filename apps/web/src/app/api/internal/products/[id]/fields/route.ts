import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

async function verifyProductOwnership(productId: string, userId: string) {
  const tenant = await getTenantForUser(userId);
  if (!tenant) return null;

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.tenantId, tenant.id)))
    .limit(1);

  return product ? tenant : null;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await verifyProductOwnership(productId, user.id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  if (!body.key || !body.label) {
    return NextResponse.json({ error: 'key and label are required' }, { status: 400 });
  }

  const [field] = await db
    .insert(productConfigFields)
    .values({
      productId,
      key: body.key,
      label: body.label,
      fieldType: body.fieldType || 'select',
      options: body.options || [],
      sortOrder: body.sortOrder || 0,
      required: body.required ?? true,
      priceModifiers: body.priceModifiers || {},
    })
    .returning();

  return NextResponse.json({ data: field });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await verifyProductOwnership(productId, user.id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Field id required' }, { status: 400 });

  const [updated] = await db
    .update(productConfigFields)
    .set({
      key: body.key,
      label: body.label,
      fieldType: body.fieldType,
      options: body.options,
      sortOrder: body.sortOrder,
      required: body.required,
      priceModifiers: body.priceModifiers,
    })
    .where(and(
      eq(productConfigFields.id, body.id),
      eq(productConfigFields.productId, productId),
    ))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await verifyProductOwnership(productId, user.id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get('fieldId');
  if (!fieldId) return NextResponse.json({ error: 'fieldId required' }, { status: 400 });

  await db
    .delete(productConfigFields)
    .where(and(
      eq(productConfigFields.id, fieldId),
      eq(productConfigFields.productId, productId),
    ));

  return NextResponse.json({ data: { deleted: true } });
}
