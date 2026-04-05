'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Ship, Activity, ArrowLeft } from 'lucide-react';

const NAV_LINKS = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
    { href: '/admin/boats', label: 'Barcos', icon: Ship },
    { href: '/admin/logs', label: 'Actividad', icon: Activity },
];

export function AdminSidebar({ email }: { email: string }) {
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    }

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200 shrink-0">
            <div className="flex h-16 items-center px-6 border-b border-gray-100 gap-2">
                <span className="text-xl font-semibold text-[var(--color-navy)] font-[family-name:var(--font-cormorant)]">
                    Aerolume
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-bold tracking-wide">
                    ADMIN
                </span>
            </div>

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

            <div className="p-4 border-t border-gray-100 space-y-2">
                <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft size={16} />
                    Volver al dashboard
                </a>
                <p className="text-[10px] text-gray-300 px-3 truncate">{email}</p>
            </div>
        </aside>
    );
}
