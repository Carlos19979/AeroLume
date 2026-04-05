import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, products, eq } from '@aerolume/db';
import { ProductsClient } from './client';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tienes un workspace configurado.
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Productos</h2>
        <p className="text-gray-500 mt-1">
          Gestiona tu catálogo de velas y configuraciones.
        </p>
      </div>
      <ProductsClient initialProducts={list} />
    </div>
  );
}
