import { NextResponse } from 'next/server';
import { db, tenants, eq } from '@aerolume/db';
import { withAdminAuth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { validateBody } from '@/lib/validations';

const updateTenantAdminSchema = z.object({
  plan: z.enum(['prueba', 'pro', 'enterprise']).optional(),
  subscriptionStatus: z.enum(['trialing', 'active', 'past_due', 'canceled']).optional(),
  name: z.string().min(1).max(200).optional(),
});

export const PUT = withAdminAuth(async (request, _ctx, params) => {
  const { id } = params;
  const body = await request.json();
  const validation = validateBody(updateTenantAdminSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (data.plan) updates.plan = data.plan;
  if (data.subscriptionStatus) updates.subscriptionStatus = data.subscriptionStatus;
  if (data.name) updates.name = data.name;

  const [updated] = await db
    .update(tenants)
    .set(updates)
    .where(eq(tenants.id, id))
    .returning();

  return NextResponse.json({ data: updated });
});
