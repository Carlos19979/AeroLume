'use client';

import { usePathname } from 'next/navigation';
import { Home, Package, Ship, FileText, Palette, Key, BarChart3, Settings } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const NAV_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/products', label: 'Productos', icon: Package },
    { href: '/dashboard/boats', label: 'Barcos', icon: Ship },
    { href: '/dashboard/quotes', label: 'Presupuestos', icon: FileText },
    { href: '/dashboard/theme', label: 'Personalizar', icon: Palette },
    { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Configuracion', icon: Settings },
];

export function Sidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    }

    const initial = (userName || userEmail || '?')[0].toUpperCase();

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200 shrink-0">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <span className="text-xl font-semibold text-[var(--color-navy)] font-[family-name:var(--font-cormorant)]">
                    Aerolume
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                                active
                                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium border-l-[3px] border-[var(--color-accent)] -ml-[3px]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        >
                            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                            {link.label}
                        </a>
                    );
                })}
            </nav>

            {/* User card */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium flex items-center justify-center shrink-0">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
