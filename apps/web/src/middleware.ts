import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);
    if (!request.nextUrl.pathname.startsWith('/embed')) {
        response.headers.set('X-Frame-Options', 'DENY');
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/v1 (public API - uses API key auth, not session)
         * - api/webhooks (called by external services, not authenticated users)
         * Note: /embed is included so security headers apply (X-Frame-Options is conditionally skipped for /embed)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/v1|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
