import { NextResponse } from 'next/server';
import { db, products, productPricingTiers, eq, and, asc } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { validateBody, replacePricingTiersSchema } from '@/lib/validations';

async function verifyProductOwnership(productId: string, tenantId: string) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
    .limit(1);

  return !!product;
}

export const GET = withTenantAuth(async (_request, { tenant }, params) => {
  const { id: productId } = params;

  if (!await verifyProductOwnership(productId, tenant.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const tiers = await db
    .select()
    .from(productPricingTiers)
    .where(eq(productPricingTiers.productId, productId))
    .orderBy(asc(productPricingTiers.sortOrder), asc(productPricingTiers.minSqm));

  return NextResponse.json({ data: tiers });
});

/**
 * Bulk-replace pricing tiers. Simpler than per-row CRUD and avoids overlap edge
 * cases. Delete + insert is non-transactional (consistent with the repo's
 * deliberate choice in clone-catalog to avoid concurrency regressions in E2E).
 */
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

  const validation = validateBody(replacePricingTiersSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { tiers } = validation.data;

  // Overlap check (server-side). Sort by minSqm and ensure each interval starts
  // strictly after the previous maxSqm.
  const sorted = [...tiers].sort((a, b) => Number(a.minSqm) - Number(b.minSqm));
  for (let i = 1; i < sorted.length; i++) {
    if (Number(sorted[i].minSqm) <= Number(sorted[i - 1].maxSqm)) {
      return NextResponse.json(
        { error: 'Tier ranges overlap' },
        { status: 400 },
      );
    }
  }

  await db
    .delete(productPricingTiers)
    .where(eq(productPricingTiers.productId, productId));

  if (sorted.length > 0) {
    await db.insert(productPricingTiers).values(
      sorted.map((t, idx) => ({
        productId,
        minSqm: t.minSqm,
        maxSqm: t.maxSqm,
        costPerSqm: t.costPerSqm,
        msrpPerSqm: t.msrpPerSqm,
        sortOrder: t.sortOrder ?? idx,
      })),
    );
  }

  const refreshed = await db
    .select()
    .from(productPricingTiers)
    .where(eq(productPricingTiers.productId, productId))
    .orderBy(asc(productPricingTiers.sortOrder), asc(productPricingTiers.minSqm));

  return NextResponse.json({ data: refreshed });
});
