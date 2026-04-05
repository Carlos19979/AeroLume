import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, analyticsEvents, eq, sql, desc } from '@aerolume/db';
import { AnalyticsClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function AnalyticsPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.tenantId, auth.tenant.id));

  const byType = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.tenantId, auth.tenant.id))
    .groupBy(analyticsEvents.eventType)
    .orderBy(desc(sql`count(*)`));

  const topBoats = await db
    .select({
      boatModel: analyticsEvents.boatModel,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${auth.tenant.id}
          AND ${analyticsEvents.boatModel} IS NOT NULL`
    )
    .groupBy(analyticsEvents.boatModel)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const topSailTypes = await db
    .select({
      sailType: analyticsEvents.sailType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${auth.tenant.id}
          AND ${analyticsEvents.sailType} IS NOT NULL`
    )
    .groupBy(analyticsEvents.sailType)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const perDay = await db
    .select({
      date: sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${auth.tenant.id}
          AND ${analyticsEvents.createdAt} > now() - interval '30 days'`
    )
    .groupBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Métricas de uso del configurador embebido." />
      <AnalyticsClient
        data={{
          total: totalResult?.count ?? 0,
          byType,
          topBoats,
          topSailTypes,
          perDay,
        }}
      />
    </div>
  );
}
