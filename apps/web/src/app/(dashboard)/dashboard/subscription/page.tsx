import { getAuthenticatedTenant } from '@/lib/auth-page';
import { redirect } from 'next/navigation';
import { db, tenants, eq } from '@aerolume/db';
import { SubscriptionClient } from './client';

export default async function SubscriptionPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) redirect('/login');

  const [tenant] = await db
    .select({
      plan: tenants.plan,
      subscriptionStatus: tenants.subscriptionStatus,
      trialEndsAt: tenants.trialEndsAt,
      lsSubscriptionId: tenants.lsSubscriptionId,
    })
    .from(tenants)
    .where(eq(tenants.id, auth.tenant.id))
    .limit(1);

  return (
    <SubscriptionClient
      plan={tenant?.plan ?? 'prueba'}
      status={tenant?.subscriptionStatus ?? 'trialing'}
      trialEndsAt={tenant?.trialEndsAt?.toISOString() ?? null}
      hasSubscription={!!tenant?.lsSubscriptionId}
    />
  );
}
