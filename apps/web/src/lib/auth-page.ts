import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { createTenantForUser } from '@/lib/create-tenant';

export async function getAuthenticatedTenant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) {
    // Auto-create tenant only in development (email confirmation disabled)
    if (process.env.NODE_ENV !== 'development') return null;
    await createTenantForUser(user);
    tenant = await getTenantForUser(user.id, user.email);
    if (!tenant) return null;
  }

  const isTrialExpired = tenant.plan === 'prueba' && (!tenant.trialEndsAt || new Date(tenant.trialEndsAt) <= new Date());
  const trialDaysLeft = tenant.plan === 'prueba' && tenant.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return { user, tenant, isTrialExpired, trialDaysLeft };
}
