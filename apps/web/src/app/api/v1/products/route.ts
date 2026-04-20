import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, products, productConfigFields, productPricingTiers, eq, inArray, and } from '@aerolume/db';
import { withCors } from '@/lib/cors';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    if ('rateLimited' in auth) return auth.response;
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const sailType = url.searchParams.get('sailType');

  const conditions = [eq(products.tenantId, auth.ctx.tenantId), eq(products.active, true)];
  if (sailType) conditions.push(eq(products.sailType, sailType as typeof products.sailType.enumValues[number]));

  // Public response: do NOT expose tenantId (internal multi-tenancy detail) or costPerSqm
  // (internal supplier cost — stripped from per-tier rows below as well).
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      variant: products.variant,
      basePrice: products.basePrice,
      costPerSqm: products.costPerSqm,
      currency: products.currency,
      descriptionShort: products.descriptionShort,
      images: products.images,
      features: products.features,
      active: products.active,
      sortOrder: products.sortOrder,
    })
    .from(products)
    .where(and(...conditions));

  const productIds = productList.map((p) => p.id);
  type ConfigFieldRow = Awaited<ReturnType<typeof selectConfigFields>>[number];
  type TierRow = Awaited<ReturnType<typeof selectTiers>>[number];
  let configFields: ConfigFieldRow[] = [];
  let tiers: TierRow[] = [];

  async function selectConfigFields(ids: string[]) {
    return db
      .select({
        id: productConfigFields.id,
        productId: productConfigFields.productId,
        key: productConfigFields.key,
        label: productConfigFields.label,
        fieldType: productConfigFields.fieldType,
        options: productConfigFields.options,
        sortOrder: productConfigFields.sortOrder,
        required: productConfigFields.required,
        msrpModifiers: productConfigFields.msrpModifiers,
        percentModifiers: productConfigFields.percentModifiers,
      })
      .from(productConfigFields)
      .where(inArray(productConfigFields.productId, ids));
  }

  async function selectTiers(ids: string[]) {
    return db
      .select({
        id: productPricingTiers.id,
        productId: productPricingTiers.productId,
        minSqm: productPricingTiers.minSqm,
        maxSqm: productPricingTiers.maxSqm,
        costPerSqm: productPricingTiers.costPerSqm,
        msrpPerSqm: productPricingTiers.msrpPerSqm,
        sortOrder: productPricingTiers.sortOrder,
      })
      .from(productPricingTiers)
      .where(inArray(productPricingTiers.productId, ids));
  }

  if (productIds.length > 0) {
    configFields = await selectConfigFields(productIds);
    tiers = await selectTiers(productIds);
  }

  // Strip internal cost fields from public response (cost belongs to tenant-only views).
  const result = productList.map((product) => {
    const publicFields = { ...product };
    delete (publicFields as { costPerSqm?: unknown }).costPerSqm;
    return {
      ...publicFields,
      configFields: configFields
        .filter((f) => f.productId === product.id)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      pricingTiers: tiers
        .filter((t) => t.productId === product.id)
        .map((t) => {
          const row = { ...t };
          delete (row as { costPerSqm?: unknown }).costPerSqm;
          return row;
        })
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    };
  });

  const origin = request.headers.get('origin');
  const res = withCors(NextResponse.json({ data: result }), origin);
  const rl = auth.ctx.rateLimitResult;
  res.headers.set('X-RateLimit-Limit', String(rl.limit));
  res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
  res.headers.set('X-RateLimit-Reset', String(rl.reset));
  return res;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}
