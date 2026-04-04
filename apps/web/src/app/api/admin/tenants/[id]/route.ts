import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { db, tenants, eq } from '@aerolume/db';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, any> = { updatedAt: new Date() };

  if (body.plan) updates.plan = body.plan;
  if (body.subscriptionStatus) updates.subscriptionStatus = body.subscriptionStatus;
  if (body.name) updates.name = body.name;

  const [updated] = await db
    .update(tenants)
    .set(updates)
    .where(eq(tenants.id, id))
    .returning();

  return NextResponse.json({ data: updated });
}
