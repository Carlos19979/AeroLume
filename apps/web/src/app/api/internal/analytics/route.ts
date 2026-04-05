import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, analyticsEvents, eq, sql, desc } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

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

  // Top boats searched
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

  // Top sail types
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
}
