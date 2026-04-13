import { db } from '@aerolume/db';
import { tenants, tenantMembers, products, productConfigFields } from '@aerolume/db';
import { slugify } from '@/lib/utils';
import { TRIAL_PRODUCT_CONFIGS } from '@/lib/trial-products';

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

    // Seed trial products
    for (const [externalId, cfg] of Object.entries(TRIAL_PRODUCT_CONFIGS)) {
        const productSlug = slugify(cfg.name);

        const [product] = await db
            .insert(products)
            .values({
                tenantId: tenant.id,
                externalId,
                name: cfg.name,
                slug: productSlug,
                sailType: cfg.sailType as typeof products.$inferInsert.sailType,
                basePrice: cfg.basePrice,
                active: true,
            })
            .returning();

        if (cfg.fields.length > 0) {
            await db.insert(productConfigFields).values(
                cfg.fields.map((field, idx) => ({
                    productId: product.id,
                    key: field.key,
                    label: field.label,
                    fieldType: 'select' as const,
                    options: field.options,
                    sortOrder: idx,
                    required: true,
                    priceModifiers: field.priceModifiers || {},
                }))
            );
        }
    }
}
