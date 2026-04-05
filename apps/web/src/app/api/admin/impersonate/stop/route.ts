import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('impersonate');
  return NextResponse.redirect(new URL('/admin/tenants', request.url));
}
