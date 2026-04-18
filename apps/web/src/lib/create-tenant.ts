import { db, tenants, tenantMembers, cloneBaseCatalogToTenant } from '@aerolume/db';
import { slugify } from '@/lib/utils';

export async function createTenantForUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    const meta = user.user_metadata ?? {};
    const name = (meta.company_name as string) || (meta.full_name as string) || user.email?.split('@')[0] || 'Mi Workspace';
    const slug = slugify(name) + '-' + user.id.slice(0, 8);
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [tenant] = await db
        .insert(tenants)
        .values({
            name,
            slug,
            plan: 'prueba',
            subscriptionStatus: 'trialing',
            trialEndsAt,
            companyName: (meta.company_name as string) || null,
            phone: (meta.phone as string) || null,
            website: (meta.website as string) || null,
            country: (meta.country as string) || null,
            city: (meta.city as string) || null,
        })
        .returning();

    await db.insert(tenantMembers).values({
        tenantId: tenant.id,
        userId: user.id,
        role: 'owner',
    });

    await cloneBaseCatalogToTenant(tenant.id);
}
