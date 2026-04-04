import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, analyticsEvents } from '@aerolume/db';

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  if (!body.eventType) {
    return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
  }

  await db.insert(analyticsEvents).values({
    tenantId: auth.ctx.tenantId,
    eventType: body.eventType,
    boatModel: body.boatModel || null,
    productId: body.productId || null,
    sailType: body.sailType || null,
    metadata: body.metadata || {},
    sessionId: body.sessionId || null,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    userAgent: request.headers.get('user-agent') || null,
    referrer: request.headers.get('referer') || null,
  });

  return NextResponse.json({ data: { tracked: true } });
}
