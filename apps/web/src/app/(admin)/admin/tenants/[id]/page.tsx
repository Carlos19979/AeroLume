import { db, tenants, tenantMembers, quotes, apiKeys, eq, desc } from '@aerolume/db';
import { notFound } from 'next/navigation';
import { TenantDetailClient } from './client';

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminTenantDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  if (!tenant) return notFound();

  const members = await db.select().from(tenantMembers).where(eq(tenantMembers.tenantId, id));
  const quoteList = await db.select({ id: quotes.id, boatModel: quotes.boatModel, customerName: quotes.customerName, status: quotes.status, createdAt: quotes.createdAt }).from(quotes).where(eq(quotes.tenantId, id)).orderBy(desc(quotes.createdAt)).limit(20);
  const keys = await db.select({ id: apiKeys.id, keyPrefix: apiKeys.keyPrefix, name: apiKeys.name, createdAt: apiKeys.createdAt }).from(apiKeys).where(eq(apiKeys.tenantId, id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/admin/tenants" className="text-white/30 hover:text-white/60 text-sm">&larr; Tenants</a>
        <h2 className="text-xl font-bold text-white">{tenant.name}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">{tenant.plan}</span>
      </div>
      <TenantDetailClient tenant={tenant} members={members} quotes={quoteList} apiKeys={keys} />
    </div>
  );
}
