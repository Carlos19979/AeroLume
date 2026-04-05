import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, products, eq } from '@aerolume/db';
import { ProductsClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function ProductsPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

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
    .where(eq(products.tenantId, auth.tenant.id));

  return (
    <div className="space-y-6">
      <PageHeader title="Productos" description="Gestiona tu catálogo de velas y configuraciones." />
      <ProductsClient initialProducts={list} />
    </div>
  );
}
