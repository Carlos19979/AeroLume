import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, quotes, eq, desc } from '@aerolume/db';
import { QuotesClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function QuotesPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

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
    .where(eq(quotes.tenantId, auth.tenant.id))
    .orderBy(desc(quotes.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader title="Presupuestos" description="Gestiona las solicitudes de presupuesto de tus clientes." />
      <QuotesClient initialQuotes={list} />
    </div>
  );
}
