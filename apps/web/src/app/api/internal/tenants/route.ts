import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@aerolume/db';
import { tenants, tenantMembers } from '@aerolume/db';
import { products, productConfigFields } from '@aerolume/db';
import { slugify } from '@/lib/utils';
import { validateBody, createTenantSchema } from '@/lib/validations';
import { TRIAL_PRODUCT_CONFIGS } from '@/lib/trial-products';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = validateBody(createTenantSchema, body);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    const name = data.name || `${user.email}'s Workspace`;
    const slug = slugify(name) + '-' + user.id.slice(0, 8);

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [tenant] = await db
        .insert(tenants)
        .values({
            name,
            slug,
            plan: 'prueba',
            subscriptionStatus: 'active',
            trialEndsAt,
            companyName: data.companyName || null,
            phone: data.phone || null,
            website: data.website || null,
            country: data.country || null,
            city: data.city || null,
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
                sailType: cfg.sailType,
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
                }))
            );
        }
    }

    return NextResponse.json({ data: tenant });
}
