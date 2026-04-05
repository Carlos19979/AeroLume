import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const tenantId = request.nextUrl.searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.redirect(new URL('/admin/tenants', request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set('impersonate', tenantId, { path: '/', maxAge: 60 * 60 }); // 1 hour

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
