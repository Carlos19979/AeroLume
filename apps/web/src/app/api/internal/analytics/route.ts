import { NextResponse } from 'next/server';
import { db, analyticsEvents, eq, sql, desc } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';

export const GET = withTenantAuth(async (_request, { tenant }) => {
  // Total events
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.tenantId, tenant.id));

  // Events by type
  const byType = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.tenantId, tenant.id))
    .groupBy(analyticsEvents.eventType)
    .orderBy(desc(sql`count(*)`));

  // Top boats searched — solo eventos `boat_search` para cuadrar con el card "Barcos buscados".
  // Antes: todos los eventos con boatModel (también product_view), inflaba el conteo.
  const topBoats = await db
    .select({
      boatModel: analyticsEvents.boatModel,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.tenantId} = ${tenant.id}
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
      sql`${analyticsEvents.tenantId} = ${tenant.id}
          AND ${analyticsEvents.sailType} IS NOT NULL
          AND ${analyticsEvents.eventType} = 'product_view'`
    )
    .groupBy(analyticsEvents.sailType)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Events per day (last 30 days)
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

  return NextResponse.json({
    data: {
      total: totalResult?.count ?? 0,
      byType,
      topBoats,
      topSailTypes,
      perDay,
    },
  });
});
