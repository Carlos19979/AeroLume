import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { db, boats, eq } from '@aerolume/db';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  const [updated] = await db
    .update(boats)
    .set({
      model: body.model,
      boatModel: body.boatModel,
      length: body.length,
      isMultihull: body.isMultihull,
      i: body.i,
      j: body.j,
      p: body.p,
      e: body.e,
      updatedAt: new Date(),
    })
    .where(eq(boats.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.delete(boats).where(eq(boats.id, id));
  return NextResponse.json({ data: { deleted: true } });
}
