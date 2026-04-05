import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, quotes, eq, desc } from '@aerolume/db';
import { QuotesClient } from './client';

export default async function QuotesPage() {
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
      id: quotes.id,
      boatModel: quotes.boatModel,
      boatLength: quotes.boatLength,
      status: quotes.status,
      customerName: quotes.customerName,
      customerEmail: quotes.customerEmail,
      totalPrice: quotes.totalPrice,
      currency: quotes.currency,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .where(eq(quotes.tenantId, tenant.id))
    .orderBy(desc(quotes.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Presupuestos</h2>
        <p className="text-gray-500 mt-1">
          Gestiona las solicitudes de presupuesto de tus clientes.
        </p>
      </div>
      <QuotesClient initialQuotes={list} />
    </div>
  );
}
