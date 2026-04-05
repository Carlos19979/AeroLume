'use client';

import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserMenu } from './components/user-menu';
import { Home, Package, Ship, FileText, Palette, Key, BarChart3, Settings } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Inicio',
    '/dashboard/products': 'Productos',
    '/dashboard/boats': 'Barcos',
    '/dashboard/quotes': 'Presupuestos',
    '/dashboard/theme': 'Personalizar',
    '/dashboard/api-keys': 'API Keys',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/settings': 'Configuracion',
};

const MOBILE_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/products', label: 'Productos', icon: Package },
    { href: '/dashboard/boats', label: 'Barcos', icon: Ship },
    { href: '/dashboard/quotes', label: 'Presupuestos', icon: FileText },
    { href: '/dashboard/theme', label: 'Personalizar', icon: Palette },
    { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Configuracion', icon: Settings },
];

export function DashboardHeader({ userName, userEmail }: { userName: string; userEmail: string }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Find best matching title
    const title = Object.entries(PAGE_TITLES)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([path]) => pathname.startsWith(path))?.[1] || 'Dashboard';

    return (
        <>
            <header className="h-16 border-b border-gray-100 bg-white flex items-center px-4 lg:px-8 justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                    >
                        <Menu size={22} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 w-64">
                        <Search size={16} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-transparent text-sm text-gray-700 placeholder:text-gray-500 outline-none w-full"
                        />
                    </div>
                    {/* User */}
                    <UserMenu name={userName} email={userEmail} />
                </div>
            </header>

            {/* Mobile nav overlay */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 md:hidden">
                        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                            <span className="text-xl font-semibold text-[var(--color-navy)] font-[family-name:var(--font-cormorant)]">
                                Aerolume
                            </span>
                            <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="px-3 py-4 space-y-1">
                            {MOBILE_LINKS.map((link) => {
                                const active = link.href === '/dashboard'
                                    ? pathname === '/dashboard'
                                    : pathname.startsWith(link.href);
                                const Icon = link.icon;
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                            active
                                                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    >
                                        <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                                        {link.label}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
