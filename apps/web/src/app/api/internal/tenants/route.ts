import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@aerolume/db';
import { tenants, tenantMembers } from '@aerolume/db';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = body.name || `${user.email}'s Workspace`;
    const slug = slugify(name) + '-' + user.id.slice(0, 8);

    const [tenant] = await db
        .insert(tenants)
        .values({
            name,
            slug,
            companyName: body.companyName || null,
            phone: body.phone || null,
            website: body.website || null,
            country: body.country || null,
            city: body.city || null,
        })
        .returning();

    await db.insert(tenantMembers).values({
        tenantId: tenant.id,
        userId: user.id,
        role: 'owner',
    });

    return NextResponse.json({ data: tenant });
}
