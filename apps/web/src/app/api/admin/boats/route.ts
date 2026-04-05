import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { db, boats } from '@aerolume/db';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  if (!body.model) {
    return NextResponse.json({ error: 'model is required' }, { status: 400 });
  }

  const [created] = await db
    .insert(boats)
    .values({
      tenantId: null, // Global boat
      model: body.model,
      boatModel: body.boatModel || body.model,
      length: body.length || null,
      isMultihull: body.isMultihull || false,
      i: body.i || null,
      j: body.j || null,
      p: body.p || null,
      e: body.e || null,
    })
    .returning();

  return NextResponse.json({ data: created });
}
