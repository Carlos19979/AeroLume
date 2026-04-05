import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { getTenantById } from '@/lib/tenant';
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

    // Check impersonation (superadmin only)
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate')?.value;
    let impersonating: { id: string; name: string } | null = null;

    if (impersonateId && isSuperAdmin(user.email)) {
        const tenant = await getTenantById(impersonateId);
        if (tenant) impersonating = { id: tenant.id, name: tenant.name };
    }

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
                <DashboardHeader userName={userName} userEmail={userEmail} />
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
