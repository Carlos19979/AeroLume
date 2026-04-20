import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth-helpers';
import { db, tenants, eq } from '@aerolume/db';

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1';

export const POST = withTenantAuth(async (_req: NextRequest, { tenant }) => {
  // Only allow cancel for tenants currently on an active pro subscription.
  if (tenant.plan !== 'pro' || tenant.subscriptionStatus !== 'active') {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
  }

  try {
    // Only hit LemonSqueezy when we actually have a subscription there.
    // Tenants promoted manually (no ls_subscription_id) skip the remote call
    // and still get the 7-day grace period applied locally.
    if (tenant.lsSubscriptionId) {
      const apiKey = process.env.LEMONSQUEEZY_API_KEY;
      if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY not set');

      const res = await fetch(`${LS_API_BASE}/subscriptions/${tenant.lsSubscriptionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json',
        },
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`LemonSqueezy cancel failed: ${err}`);
      }

      // Consume the LS response (not used — our grace period is app-defined)
      await res.json().catch(() => null);
    }

    // Compute our own 7-day grace period (independent of LS billing cycle)
    const graceEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update DB immediately so the UI reflects the change without waiting for webhook
    await db
      .update(tenants)
      .set({
        subscriptionStatus: 'canceled',
        cancelationGraceEndsAt: graceEndsAt,
      })
      .where(eq(tenants.id, tenant.id));

    return NextResponse.json({ ok: true, graceEndsAt: graceEndsAt.toISOString() });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
});
