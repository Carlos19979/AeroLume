import { NextResponse } from 'next/server';
import { db, products, tenants, eq } from '@aerolume/db';
import { canCreateProducts } from '@/lib/plan-gates';
import { withTenantAuth } from '@/lib/auth-helpers';
import { slugify } from '@/lib/utils';
import { validateBody, createProductSchema } from '@/lib/validations';

export const GET = withTenantAuth(async (_request, { tenant }) => {
  const list = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      basePrice: products.basePrice,
      currency: products.currency,
      active: products.active,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  return NextResponse.json({ data: list });
});


export const POST = withTenantAuth(async (request, { tenant }) => {
  // Check plan
  const [full] = await db.select({ plan: tenants.plan, subscriptionStatus: tenants.subscriptionStatus }).from(tenants).where(eq(tenants.id, tenant.id)).limit(1);
  if (full && !canCreateProducts(full)) {
    return NextResponse.json({ error: 'Plan limit reached' }, { status: 403 });
  }

  const body = await request.json();
  const validation = validateBody(createProductSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [created] = await db
    .insert(products)
    .values({
      tenantId: tenant.id,
      name: data.name,
      slug: slugify(data.name),
      sailType: data.sailType,
      basePrice: data.basePrice || null,
      descriptionShort: null,
      active: true,
    })
    .returning();

  return NextResponse.json({ data: created });
});
