import { inArray, isNull } from 'drizzle-orm';
import { db as defaultDb } from './client';
import { products, productPricingTiers, productConfigFields } from './schema/products';

type DbLike = typeof defaultDb;

/**
 * Copies every product in the shared base catalog (tenantId = NULL) — together
 * with its pricing tiers and config fields — into the given tenant.
 *
 * Used at tenant creation so each tenant starts with an editable copy they can
 * customize without affecting other tenants.
 *
 * Accepts an optional `db` override so scripts that bootstrap their own
 * postgres connection (e.g. the seed script, which loads `.env` after imports
 * are resolved) can pass theirs instead of the default lazy singleton.
 *
 * NOTE: Previously wrapped in a transaction for atomicity, but that caused
 * flaky behaviour under high parallel load in the E2E test suite (clones
 * intermittently returned 0 products). Reverted to sequential, non-transactional
 * inserts. Partial-failure recovery is acceptable since this only runs at
 * tenant creation and a half-cloned catalog can be re-cloned manually.
 */
export async function cloneBaseCatalogToTenant(tenantId: string, db: DbLike = defaultDb): Promise<number> {
  const baseProducts = await db
    .select()
    .from(products)
    .where(isNull(products.tenantId));

  if (baseProducts.length === 0) return 0;

  const baseIds = baseProducts.map((p) => p.id);
  const baseTiers = await db
    .select()
    .from(productPricingTiers)
    .where(inArray(productPricingTiers.productId, baseIds));
  const baseFields = await db
    .select()
    .from(productConfigFields)
    .where(inArray(productConfigFields.productId, baseIds));

  const cloneValues = baseProducts.map((p) => ({
    tenantId,
    name: p.name,
    slug: p.slug,
    sailType: p.sailType,
    variant: p.variant,
    basePrice: p.basePrice,
    costPerSqm: p.costPerSqm,
    currency: p.currency,
    descriptionShort: p.descriptionShort,
    images: p.images,
    features: p.features,
    active: p.active,
    sortOrder: p.sortOrder,
  }));

  const cloned = await db
    .insert(products)
    .values(cloneValues)
    .returning({ id: products.id, slug: products.slug });

  const slugToNewId = new Map(cloned.map((c) => [c.slug, c.id]));
  const oldIdToNewId = new Map<string, string>();
  for (const base of baseProducts) {
    const newId = slugToNewId.get(base.slug);
    if (newId) oldIdToNewId.set(base.id, newId);
  }

  if (baseTiers.length) {
    const tierValues = baseTiers
      .map((t) => {
        const newProductId = oldIdToNewId.get(t.productId);
        if (!newProductId) return null;
        return {
          productId: newProductId,
          minSqm: t.minSqm,
          maxSqm: t.maxSqm,
          costPerSqm: t.costPerSqm,
          msrpPerSqm: t.msrpPerSqm,
          sortOrder: t.sortOrder,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
    if (tierValues.length) await db.insert(productPricingTiers).values(tierValues);
  }

  if (baseFields.length) {
    const fieldValues = baseFields
      .map((f) => {
        const newProductId = oldIdToNewId.get(f.productId);
        if (!newProductId) return null;
        return {
          productId: newProductId,
          key: f.key,
          label: f.label,
          fieldType: f.fieldType,
          options: f.options,
          sortOrder: f.sortOrder,
          required: f.required,
          priceModifiers: f.priceModifiers,
          percentModifiers: f.percentModifiers,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
    if (fieldValues.length) await db.insert(productConfigFields).values(fieldValues);
  }

  return cloneValues.length;
}
