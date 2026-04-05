'use client';

import { AppSidebar } from '@/components/ui/AppSidebar';
import { DASHBOARD_NAV } from '@/lib/navigation';

export function Sidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
    const initial = (userName || userEmail || '?')[0].toUpperCase();

    return (
        <AppSidebar
            links={DASHBOARD_NAV}
            footer={
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
            }
        />
    );
}
