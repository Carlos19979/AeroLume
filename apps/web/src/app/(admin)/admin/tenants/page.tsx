import { db, tenants, tenantMembers, products, quotes, sql, eq, desc } from '@aerolume/db';
import { TenantsClient } from './client';

export default async function AdminTenantsPage() {
  const allTenants = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      plan: tenants.plan,
      subscriptionStatus: tenants.subscriptionStatus,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  // Get counts per tenant
  const tenantData = await Promise.all(
    allTenants.map(async (t) => {
      const [pc] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.tenantId, t.id));
      const [qc] = await db.select({ count: sql<number>`count(*)::int` }).from(quotes).where(eq(quotes.tenantId, t.id));
      const members = await db.select({ userId: tenantMembers.userId, role: tenantMembers.role }).from(tenantMembers).where(eq(tenantMembers.tenantId, t.id));
      return { ...t, productCount: pc?.count ?? 0, quoteCount: qc?.count ?? 0, memberCount: members.length };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Tenants</h2>
        <span className="text-xs text-white/30">{allTenants.length} total</span>
      </div>
      <TenantsClient tenants={tenantData} />
    </div>
  );
}
