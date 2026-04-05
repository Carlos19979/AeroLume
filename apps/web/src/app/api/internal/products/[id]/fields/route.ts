import { NextResponse } from 'next/server';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { validateBody, createConfigFieldSchema, updateConfigFieldSchema } from '@/lib/validations';

async function verifyProductOwnership(productId: string, tenantId: string) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
    .limit(1);

  return !!product;
}

export const POST = withTenantAuth(async (request, { tenant }, params) => {
  const { id: productId } = params;

  if (!await verifyProductOwnership(productId, tenant.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = validateBody(createConfigFieldSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [field] = await db
    .insert(productConfigFields)
    .values({
      productId,
      key: data.key,
      label: data.label,
      fieldType: data.fieldType,
      options: data.options || [],
      sortOrder: data.sortOrder || 0,
      required: data.required,
      priceModifiers: data.priceModifiers || {},
    })
    .returning();

  return NextResponse.json({ data: field });
});

export const PUT = withTenantAuth(async (request, { tenant }, params) => {
  const { id: productId } = params;

  if (!await verifyProductOwnership(productId, tenant.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = validateBody(updateConfigFieldSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [updated] = await db
    .update(productConfigFields)
    .set({
      key: data.key,
      label: data.label,
      fieldType: data.fieldType,
      options: data.options,
      sortOrder: data.sortOrder,
      required: data.required,
      priceModifiers: data.priceModifiers,
    })
    .where(and(
      eq(productConfigFields.id, data.id),
      eq(productConfigFields.productId, productId),
    ))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
});

export const DELETE = withTenantAuth(async (request, { tenant }, params) => {
  const { id: productId } = params;

  if (!await verifyProductOwnership(productId, tenant.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

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
});
