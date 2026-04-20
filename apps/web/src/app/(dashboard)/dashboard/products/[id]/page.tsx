import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, products, productConfigFields, productPricingTiers, eq, and, asc } from '@aerolume/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductEditClient } from './client';

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

  const { tenant } = auth;

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .limit(1);

  if (!product) return notFound();

  const fields = await db
    .select()
    .from(productConfigFields)
    .where(eq(productConfigFields.productId, id));

  const tiers = await db
    .select()
    .from(productPricingTiers)
    .where(eq(productPricingTiers.productId, id))
    .orderBy(asc(productPricingTiers.sortOrder), asc(productPricingTiers.minSqm));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products" className="text-gray-500 hover:text-gray-600">
          &larr; Productos
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
      </div>
      <ProductEditClient product={product} initialFields={fields} initialTiers={tiers} />
    </div>
  );
}
