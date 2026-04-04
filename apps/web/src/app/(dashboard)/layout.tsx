import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-[var(--navy)] text-white">
                <div className="flex h-16 items-center px-6">
                    <span className="text-xl font-semibold font-[family-name:var(--font-cormorant)]">
                        Aerolume
                    </span>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <SidebarLink href="/dashboard" label="Inicio" />
                    <SidebarLink href="/dashboard/products" label="Productos" />
                    <SidebarLink href="/dashboard/boats" label="Barcos" />
                    <SidebarLink href="/dashboard/quotes" label="Presupuestos" />
                    <SidebarLink href="/dashboard/theme" label="Personalizar" />
                    <SidebarLink href="/dashboard/api-keys" label="API Keys" />
                    <SidebarLink href="/dashboard/analytics" label="Analytics" />
                    <SidebarLink href="/dashboard/settings" label="Configuración" />
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
                    <h1 className="text-lg font-medium text-gray-900">Dashboard</h1>
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            className="block px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
            {label}
        </a>
    );
}
