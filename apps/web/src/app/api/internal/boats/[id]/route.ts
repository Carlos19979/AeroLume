import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, boats, eq, and, or, sql } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

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
}
