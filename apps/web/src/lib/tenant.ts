import { db, tenantMembers, tenants, eq } from '@aerolume/db';

/**
 * Get the tenant for a given user ID.
 * Returns the first tenant the user is a member of.
 */
export async function getTenantForUser(userId: string) {
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
