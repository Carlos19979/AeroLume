import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, analyticsEvents } from '@aerolume/db';
import { withCors } from '@/lib/cors';
import { validateBody, createAnalyticsEventSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    if ('rateLimited' in auth) return auth.response;
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const origin = request.headers.get('origin');
    return withCors(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }), origin);
  }

  const validation = validateBody(createAnalyticsEventSchema, body);
  if ('error' in validation) {
    const origin = request.headers.get('origin');
    return withCors(NextResponse.json({ error: validation.error }, { status: 400 }), origin);
  }
  const data = validation.data;

  await db.insert(analyticsEvents).values({
    tenantId: auth.ctx.tenantId,
    eventType: data.eventType,
    boatModel: data.boatModel || null,
    productId: data.productId || null,
    sailType: data.sailType || null,
    metadata: data.metadata || {},
    sessionId: data.sessionId || null,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    userAgent: request.headers.get('user-agent') || null,
    referrer: request.headers.get('referer') || null,
  });

  const origin = request.headers.get('origin');
  return withCors(NextResponse.json({ data: { tracked: true } }), origin);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}
