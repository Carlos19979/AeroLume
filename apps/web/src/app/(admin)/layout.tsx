import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { AdminSidebar } from './sidebar';

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

    return (
        <div className="min-h-screen flex bg-gray-950">
            <AdminSidebar email={user.email || ''} />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-white/[0.06] flex items-center px-8">
                    <h1 className="text-sm font-medium text-white/60">Admin Panel</h1>
                    <span className="ml-auto text-xs text-red-400/60 bg-red-500/10 px-2 py-0.5 rounded">SUPERADMIN</span>
                </header>
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
