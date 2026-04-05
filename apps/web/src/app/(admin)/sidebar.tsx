'use client';

import { ArrowLeft } from 'lucide-react';
import { AppSidebar } from '@/components/ui/AppSidebar';
import { ADMIN_NAV } from '@/lib/navigation';

export function AdminSidebar({ email }: { email: string }) {
    return (
        <AppSidebar
            links={ADMIN_NAV}
            header={
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-bold tracking-wide">
                    ADMIN
                </span>
            }
            footer={
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
            }
        />
    );
}
