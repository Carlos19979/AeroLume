import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';

export async function getAuthenticatedTenant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return null;

  return { user, tenant };
}
