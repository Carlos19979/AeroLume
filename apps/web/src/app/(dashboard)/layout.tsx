import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { getTenantForUser, getTenantById } from '@/lib/tenant';
import { db, tenants, eq } from '@aerolume/db';
import { isSuspended, getDashboardBanner } from '@/lib/plan-gates';
import { Sidebar } from './sidebar';
import { DashboardHeader } from './header';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
    const userEmail = user.email || '';
    const isAdmin = isSuperAdmin(user.email);

    // Check impersonation (superadmin only)
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate')?.value;
    let impersonating: { id: string; name: string } | null = null;

    if (impersonateId && isAdmin) {
        const tenant = await getTenantById(impersonateId);
        if (tenant) impersonating = { id: tenant.id, name: tenant.name };
    }

    // Get tenant plan/status for gating (skip for impersonation and admin)
    let planStatus = { plan: 'pro' as string | null, subscriptionStatus: 'active' as string | null };

    if (!isAdmin && !impersonating) {
        const tenant = await getTenantForUser(user.id, user.email);
        if (tenant) {
            const [full] = await db
                .select({ plan: tenants.plan, subscriptionStatus: tenants.subscriptionStatus })
                .from(tenants)
                .where(eq(tenants.id, tenant.id))
                .limit(1);
            if (full) planStatus = full;
        }
    }

    // Suspended: block everything
    if (isSuspended(planStatus) && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-cormorant)]">
                        Cuenta suspendida
                    </h1>
                    <p className="mt-3 text-gray-500 leading-relaxed">
                        Tu cuenta ha sido suspendida por falta de pago. Contacta con nosotros para reactivarla.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <a href="/contact" className="px-6 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl hover:opacity-90">
                            Contactar
                        </a>
                        <a href="/auth/signout" className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">
                            Cerrar sesion
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const banner = getDashboardBanner(planStatus);

    return (
        <div className="min-h-screen flex bg-[var(--color-surface)]">
            <Sidebar userName={userName} userEmail={userEmail} />
            <div className="flex-1 flex flex-col min-w-0">
                {impersonating && (
                    <div className="bg-amber-500 text-amber-950 text-xs font-medium px-4 py-2 flex items-center justify-between">
                        <span>Viendo como: <strong>{impersonating.name}</strong> (impersonacion)</span>
                        <a href="/api/admin/impersonate/stop" className="underline hover:no-underline">Salir</a>
                    </div>
                )}
                {banner.type === 'trial' && (
                    <div className="bg-blue-50 text-blue-700 text-xs font-medium px-4 py-2.5 flex items-center justify-between border-b border-blue-100">
                        <span>{banner.message}</span>
                        <a href="/contact" className="underline hover:no-underline font-semibold">Activar ahora</a>
                    </div>
                )}
                {banner.type === 'past_due' && (
                    <div className="bg-red-50 text-red-700 text-xs font-medium px-4 py-2.5 flex items-center justify-between border-b border-red-100">
                        <span>{banner.message}</span>
                        <a href="/contact" className="underline hover:no-underline font-semibold">Pagar ahora</a>
                    </div>
                )}
                <DashboardHeader userName={userName} userEmail={userEmail} />
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
