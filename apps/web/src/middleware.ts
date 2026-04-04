import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/v1 (public API - uses API key auth, not session)
         * - embed (widget embed - uses API key auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/v1|embed|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
