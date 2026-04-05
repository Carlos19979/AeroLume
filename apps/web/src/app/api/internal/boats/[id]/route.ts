import { NextResponse } from 'next/server';
import { db, boats, eq, and, or, sql } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';

export const GET = withTenantAuth(async (_request, { tenant }, params) => {
  const { id } = params;

  const [boat] = await db
    .select()
    .from(boats)
    .where(and(
      eq(boats.id, id),
      or(eq(boats.tenantId, tenant.id), sql`${boats.tenantId} IS NULL`)
    ))
    .limit(1);

  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: boat });
});
