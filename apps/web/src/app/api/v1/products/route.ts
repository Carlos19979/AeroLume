import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, products, productConfigFields, eq, inArray, and } from '@aerolume/db';
import { withCors } from '@/lib/cors';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const sailType = url.searchParams.get('sailType');

  const conditions = [eq(products.tenantId, auth.ctx.tenantId)];
  if (sailType) conditions.push(eq(products.sailType, sailType as typeof products.sailType.enumValues[number]));

  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      basePrice: products.basePrice,
      currency: products.currency,
      descriptionShort: products.descriptionShort,
      images: products.images,
      active: products.active,
      sortOrder: products.sortOrder,
    })
    .from(products)
    .where(and(...conditions));

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
        priceModifiers: productConfigFields.priceModifiers,
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

  const origin = request.headers.get('origin');
  return withCors(NextResponse.json({ data: result }), origin);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}
