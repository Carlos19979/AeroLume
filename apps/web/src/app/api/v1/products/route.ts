import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, products, productConfigFields, eq, inArray } from '@aerolume/db';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const sailType = url.searchParams.get('sailType');

  let query = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      gamme: products.gamme,
      basePrice: products.basePrice,
      currency: products.currency,
      descriptionShort: products.descriptionShort,
      images: products.images,
      minBoatLength: products.minBoatLength,
      maxBoatLength: products.maxBoatLength,
      active: products.active,
      sortOrder: products.sortOrder,
    })
    .from(products)
    .where(eq(products.tenantId, auth.ctx.tenantId))
    .$dynamic();

  if (sailType) {
    query = query.where(eq(products.sailType, sailType));
  }

  const productList = await query;

  // Fetch config fields for all products
  const productIds = productList.map((p) => p.id);
  let configFields: any[] = [];

  if (productIds.length > 0) {
    configFields = await db
      .select({
        id: productConfigFields.id,
        productId: productConfigFields.productId,
        key: productConfigFields.key,
        label: productConfigFields.label,
        fieldType: productConfigFields.fieldType,
        options: productConfigFields.options,
        sortOrder: productConfigFields.sortOrder,
        required: productConfigFields.required,
      })
      .from(productConfigFields)
      .where(inArray(productConfigFields.productId, productIds));
  }

  // Group config fields by product
  const result = productList.map((product) => ({
    ...product,
    configFields: configFields
      .filter((f) => f.productId === product.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  }));

  return NextResponse.json({ data: result });
}
