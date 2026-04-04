import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { notFound } from 'next/navigation';
import { ProductEditClient } from './client';

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return notFound();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/dashboard/products" className="text-gray-400 hover:text-gray-600">
          &larr; Productos
        </a>
        <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
      </div>
      <ProductEditClient product={product} initialFields={fields} />
    </div>
  );
}
