import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { AdminSidebar } from './sidebar';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isSuperAdmin(user.email)) {
        redirect('/dashboard');
    }

    // MFA gate (SSR) — only enforced when ENFORCE_SUPER_ADMIN_MFA=1
    if (process.env.ENFORCE_SUPER_ADMIN_MFA === '1') {
        const headersList = await headers();
        const pathname = headersList.get('x-pathname') ?? '';
        // Skip MFA gate for the MFA pages themselves to avoid redirect loops
        const isMfaPage = pathname.startsWith('/admin/mfa');

        if (!isMfaPage) {
            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (aalData) {
                const { currentLevel, nextLevel } = aalData;
                if (currentLevel === 'aal1' && nextLevel === 'aal1') {
                    redirect('/admin/mfa');
                }
                if (currentLevel === 'aal1' && nextLevel === 'aal2') {
                    redirect(`/admin/mfa/challenge?redirectTo=${encodeURIComponent(pathname || '/admin')}`);
                }
            }
        }
    }

    return (
        <div className="min-h-screen flex bg-[var(--color-surface)]">
            <AdminSidebar email={user.email || ''} />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
                    <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-medium">SUPERADMIN</span>
                </header>
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
