'use client';

import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import type { NavItem } from '@/lib/navigation';

interface AppSidebarProps {
  links: NavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isActiveOverride?: (href: string, pathname: string) => boolean;
}

export function AppSidebar({ links, header, footer, isActiveOverride }: AppSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (isActiveOverride) return isActiveOverride(href, pathname);
    // Exact match for root paths (e.g. /dashboard, /admin)
    const isRoot = links.length > 0 && href === links[0].href;
    if (isRoot) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200 shrink-0">
      <div className="flex h-16 items-center px-6 border-b border-gray-100 gap-2">
        <span className="text-xl font-semibold text-[var(--color-navy)] font-[family-name:var(--font-cormorant)]">
          Aerolume
        </span>
        {header}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              {label}
            </a>
          );
        })}
      </nav>

      {footer}
    </aside>
  );
}
