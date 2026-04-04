import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, quotes, quoteItems, eq, and } from '@aerolume/db';
import { notFound } from 'next/navigation';
import { QuoteDetailClient } from './client';

type PageProps = { params: Promise<{ id: string }> };

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return notFound();

  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenant.id)))
    .limit(1);

  if (!quote) return notFound();

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/dashboard/quotes" className="text-gray-400 hover:text-gray-600">
          &larr; Presupuestos
        </a>
        <h2 className="text-2xl font-semibold text-gray-900">
          Presupuesto {quote.boatModel ? `— ${quote.boatModel}` : ''}
        </h2>
      </div>
      <QuoteDetailClient quote={quote} items={items} />
    </div>
  );
}
