import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MobileNav } from './mobile-nav';

const NAV_LINKS = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/products', label: 'Productos' },
    { href: '/dashboard/boats', label: 'Barcos' },
    { href: '/dashboard/quotes', label: 'Presupuestos' },
    { href: '/dashboard/theme', label: 'Personalizar' },
    { href: '/dashboard/api-keys', label: 'API Keys' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/settings', label: 'Configuración' },
];

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
            {/* Desktop Sidebar */}
            <aside className="flex w-64 flex-col bg-[var(--color-navy)] text-white shrink-0 max-md:hidden">
                <div className="flex h-16 items-center px-6">
                    <span className="text-xl font-semibold font-[family-name:var(--font-cormorant)]">
                        Aerolume
                    </span>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="block px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
                    <div className="flex items-center gap-3">
                        <MobileNav links={NAV_LINKS} />
                        <h1 className="text-lg font-medium text-gray-900">Dashboard</h1>
                    </div>
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
