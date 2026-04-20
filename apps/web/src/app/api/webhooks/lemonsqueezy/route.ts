import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/lemonsqueezy';
import { db, tenants, eq } from '@aerolume/db';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  try {
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }

  const event = JSON.parse(body);
  const eventName = event.meta.event_name as string;
  const tenantId = event.meta.custom_data?.tenant_id as string | undefined;

  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 });
  }

  const lsCustomerId = String(event.data.attributes.customer_id);
  const lsSubscriptionId = String(event.data.id);

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated': {
      const status = event.data.attributes.status;
      let subscriptionStatus: 'active' | 'past_due' | 'canceled' = 'active';
      if (status === 'past_due') subscriptionStatus = 'past_due';
      if (status === 'cancelled' || status === 'expired' || status === 'unpaid') subscriptionStatus = 'canceled';

      await db.update(tenants)
        .set({
          plan: 'pro',
          subscriptionStatus,
          lsCustomerId,
          lsSubscriptionId,
          ...(subscriptionStatus === 'active' ? { cancelationGraceEndsAt: null } : {}),
        })
        .where(eq(tenants.id, tenantId));
      break;
    }

    case 'subscription_cancelled': {
      await db.update(tenants)
        .set({ subscriptionStatus: 'canceled' })
        .where(eq(tenants.id, tenantId));
      break;
    }

    case 'subscription_expired': {
      // Grace period ended — revoke pro access entirely and downgrade plan.
      await db.update(tenants)
        .set({ subscriptionStatus: 'expired', plan: 'prueba', trialEndsAt: null, cancelationGraceEndsAt: null })
        .where(eq(tenants.id, tenantId));
      break;
    }

    case 'subscription_payment_success': {
      await db.update(tenants)
        .set({ plan: 'pro', subscriptionStatus: 'active', cancelationGraceEndsAt: null })
        .where(eq(tenants.id, tenantId));
      break;
    }

    case 'subscription_payment_failed': {
      await db.update(tenants)
        .set({ subscriptionStatus: 'past_due' })
        .where(eq(tenants.id, tenantId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
