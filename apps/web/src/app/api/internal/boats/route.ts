import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, boats, sql, eq, or } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Number(url.searchParams.get('pageSize') || '50'));
  const search = url.searchParams.get('search')?.trim();
  const offset = (page - 1) * pageSize;

  const whereClause = search && search.length >= 2
    ? sql`(${boats.tenantId} = ${tenant.id} OR ${boats.tenantId} IS NULL) AND ${boats.model} ILIKE ${'%' + search + '%'}`
    : sql`${boats.tenantId} = ${tenant.id} OR ${boats.tenantId} IS NULL`;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(boats)
    .where(whereClause);

  const list = await db
    .select({
      id: boats.id,
      model: boats.model,
      boatModel: boats.boatModel,
      length: boats.length,
      isMultihull: boats.isMultihull,
      tenantId: boats.tenantId,
    })
    .from(boats)
    .where(whereClause)
    .orderBy(boats.model)
    .limit(pageSize)
    .offset(offset);

  return NextResponse.json({
    data: list,
    pagination: {
      page,
      pageSize,
      total: countResult?.count ?? 0,
      totalPages: Math.ceil((countResult?.count ?? 0) / pageSize),
    },
  });
}
