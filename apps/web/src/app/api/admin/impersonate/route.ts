import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-helpers';
import { cookies } from 'next/headers';

export const GET = withAdminAuth(async (request) => {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.redirect(new URL('/admin/tenants', request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set('impersonate', tenantId, {
    path: '/',
    maxAge: 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
});
