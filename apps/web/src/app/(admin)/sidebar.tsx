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
        <aside className="hidden md:flex md:w-56 md:flex-col bg-gray-950 border-r border-white/[0.06] shrink-0">
            <div className="flex h-14 items-center px-5 border-b border-white/[0.06]">
                <span className="text-sm font-bold tracking-[0.1em] uppercase text-white/80">
                    Aerolume
                </span>
                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                    ADMIN
                </span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                                active
                                    ? 'bg-white/[0.08] text-white font-medium'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                            }`}
                        >
                            <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                            {link.label}
                        </a>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/[0.06]">
                <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                    <ArrowLeft size={14} />
                    Volver al dashboard
                </a>
                <p className="text-[10px] text-white/20 mt-2 px-3 truncate">{email}</p>
            </div>
        </aside>
    );
}
