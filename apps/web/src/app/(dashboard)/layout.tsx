import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

    return (
        <div className="min-h-screen flex bg-[var(--color-surface)]">
            <Sidebar userName={userName} userEmail={userEmail} />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader userName={userName} userEmail={userEmail} />
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
