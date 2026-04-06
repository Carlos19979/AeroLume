import { NextResponse } from 'next/server';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { validateBody, updateProductSchema } from '@/lib/validations';

export const GET = withTenantAuth(async (_request, { tenant }, params) => {
  const { id } = params;

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
});

export const PUT = withTenantAuth(async (request, { tenant }, params) => {
  const { id } = params;
  const body = await request.json();
  const validation = validateBody(updateProductSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [updated] = await db
    .update(products)
    .set({
      name: data.name,
      sailType: data.sailType,
      basePrice: data.basePrice,
      currency: data.currency,
      descriptionShort: data.descriptionShort,
      active: data.active,
      sortOrder: data.sortOrder,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
});

export const DELETE = withTenantAuth(async (_request, { tenant }, params) => {
  const { id } = params;

  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)));

  return NextResponse.json({ data: { deleted: true } });
});
