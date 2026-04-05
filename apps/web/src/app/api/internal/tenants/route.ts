import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@aerolume/db';
import { tenants, tenantMembers } from '@aerolume/db';
import { slugify } from '@/lib/utils';
import { validateBody, createTenantSchema } from '@/lib/validations';

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

    const [tenant] = await db
        .insert(tenants)
        .values({
            name,
            slug,
            plan: 'prueba',
            subscriptionStatus: 'active',
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

    return NextResponse.json({ data: tenant });
}
