import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { createTenantForUser } from '@/lib/create-tenant';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    let next = searchParams.get('next') ?? '/dashboard';
    // Prevent open redirect
    if (!next.startsWith('/') || next.startsWith('//')) {
        next = '/dashboard';
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Check if user needs a tenant (first login after email confirmation)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const existing = await getTenantForUser(user.id, user.email);
                if (!existing) {
                    await createTenantForUser(user);
                }
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login on error
    return NextResponse.redirect(`${origin}/login`);
}
