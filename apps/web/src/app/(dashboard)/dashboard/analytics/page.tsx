import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, analyticsEvents, quotes, eq, sql, desc, and } from '@aerolume/db';
import { AnalyticsClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

// Analytics debe reflejar siempre el estado real de la DB — no cachear el render.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Top boats searched — solo eventos `boat_search` para cuadrar con el card "Barcos buscados".
  // Antes: todos los eventos con boatModel (también product_view / configurator_opened), inflaba el conteo.
  const topBoats = await db
    .select({
      boatModel: analyticsEvents.boatModel,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${auth.tenant.id}
          AND ${analyticsEvents.boatModel} IS NOT NULL
          AND ${analyticsEvents.eventType} = 'boat_search'`
    )
    .groupBy(analyticsEvents.boatModel)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top sail types — solo eventos `product_view` para cuadrar con el card "Productos vistos".
  const topSailTypes = await db
    .select({
      sailType: analyticsEvents.sailType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${auth.tenant.id}
          AND ${analyticsEvents.sailType} IS NOT NULL
          AND ${analyticsEvents.eventType} = 'product_view'`
    )
    .groupBy(analyticsEvents.sailType)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const [acceptedQuotes] = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`COALESCE(SUM(${quotes.totalPrice}), 0)::text`,
    })
    .from(quotes)
    .where(and(eq(quotes.tenantId, auth.tenant.id), eq(quotes.status, 'accepted')));

  const [quoteTotal] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quotes)
    .where(eq(quotes.tenantId, auth.tenant.id));

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
          acceptedQuoteCount: acceptedQuotes?.count ?? 0,
          acceptedQuoteRevenue: Number(acceptedQuotes?.revenue ?? 0),
          quoteTotalCount: quoteTotal?.count ?? 0,
        }}
      />
    </div>
  );
}
