import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, analyticsEvents, eq, sql, desc } from '@aerolume/db';
import { AnalyticsClient } from './client';

export default async function AnalyticsPage() {
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

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.tenantId, tenant.id));

  const byType = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.tenantId, tenant.id))
    .groupBy(analyticsEvents.eventType)
    .orderBy(desc(sql`count(*)`));

  const topBoats = await db
    .select({
      boatModel: analyticsEvents.boatModel,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${tenant.id}
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
      sql`${analyticsEvents.tenantId} = ${tenant.id}
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
      sql`${analyticsEvents.tenantId} = ${tenant.id}
          AND ${analyticsEvents.createdAt} > now() - interval '30 days'`
    )
    .groupBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-gray-500 mt-1">
          Métricas de uso del configurador embebido.
        </p>
      </div>
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
