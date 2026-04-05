import { db, tenantMembers, tenants, eq } from '@aerolume/db';
import { cookies } from 'next/headers';
import { isSuperAdmin } from '@/lib/admin';

/**
 * Get the tenant for a given user ID.
 * Returns the first tenant the user is a member of.
 */
export async function getTenantForUser(userId: string, userEmail?: string) {
  // Check impersonation cookie (superadmin only)
  try {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate')?.value;
    if (impersonateId && isSuperAdmin(userEmail)) {
      const impersonated = await getTenantById(impersonateId);
      if (impersonated) return impersonated;
    }
  } catch {
    // cookies() may fail in non-request contexts
  }

  const result = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      plan: tenants.plan,
    })
    .from(tenantMembers)
    .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
    .where(eq(tenantMembers.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get tenant by ID directly (for impersonation).
 */
export async function getTenantById(tenantId: string) {
  const [result] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      plan: tenants.plan,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return result ?? null;
}
