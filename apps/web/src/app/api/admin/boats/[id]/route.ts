import { NextResponse } from 'next/server';
import { db, boats, eq } from '@aerolume/db';
import { withAdminAuth } from '@/lib/auth-helpers';
import { validateBody, updateBoatSchema } from '@/lib/validations';

export const PUT = withAdminAuth(async (request, _ctx, params) => {
  const { id } = params;
  const body = await request.json();
  const validation = validateBody(updateBoatSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [updated] = await db
    .update(boats)
    .set({
      model: data.model,
      boatModel: data.boatModel,
      length: data.length,
      isMultihull: data.isMultihull,
      i: data.i,
      j: data.j,
      p: data.p,
      e: data.e,
      updatedAt: new Date(),
    })
    .where(eq(boats.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
});

export const DELETE = withAdminAuth(async (_request, _ctx, params) => {
  const { id } = params;

  await db.delete(boats).where(eq(boats.id, id));
  return NextResponse.json({ data: { deleted: true } });
});
