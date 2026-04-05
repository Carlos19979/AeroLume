import { NextResponse } from 'next/server';
import { db, boats } from '@aerolume/db';
import { withAdminAuth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { validateBody, numericString } from '@/lib/validations';

const createBoatSchema = z.object({
  model: z.string().min(1).max(200),
  boatModel: z.string().max(200).optional(),
  length: numericString.optional().nullable(),
  isMultihull: z.boolean().optional(),
  i: numericString.optional().nullable(),
  j: numericString.optional().nullable(),
  p: numericString.optional().nullable(),
  e: numericString.optional().nullable(),
});

export const POST = withAdminAuth(async (request) => {
  const body = await request.json();
  const validation = validateBody(createBoatSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [created] = await db
    .insert(boats)
    .values({
      tenantId: null, // Global boat
      model: data.model,
      boatModel: data.boatModel || data.model,
      length: data.length || null,
      isMultihull: data.isMultihull || false,
      i: data.i || null,
      j: data.j || null,
      p: data.p || null,
      e: data.e || null,
    })
    .returning();

  return NextResponse.json({ data: created });
});
