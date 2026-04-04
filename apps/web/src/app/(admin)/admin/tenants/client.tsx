'use client';

import { useState } from 'react';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  subscriptionStatus: string | null;
  createdAt: Date | null;
  productCount: number;
  quoteCount: number;
  memberCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  trialing: 'bg-yellow-500/20 text-yellow-400',
  past_due: 'bg-red-500/20 text-red-400',
  canceled: 'bg-white/10 text-white/40',
};

export function TenantsClient({ tenants }: { tenants: TenantRow[] }) {
  const [search, setSearch] = useState('');

  const filtered = search.length >= 2
    ? tenants.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase()))
    : tenants;

  return (
    <>
      <input
        type="text"
        placeholder="Buscar tenant..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20"
      />

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-white/30 border-b border-white/[0.04]">
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-5 py-3">Plan</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="text-left px-5 py-3">Productos</th>
              <th className="text-left px-5 py-3">Quotes</th>
              <th className="text-left px-5 py-3">Miembros</th>
              <th className="text-left px-5 py-3">Creado</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="text-white/80 font-medium">{t.name}</p>
                  <p className="text-[10px] text-white/25 font-mono">{t.slug}</p>
                </td>
                <td className="px-5 py-3 text-white/50 text-xs">{t.plan || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.subscriptionStatus || ''] || STATUS_COLORS.canceled}`}>
                    {t.subscriptionStatus || '—'}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/50">{t.productCount}</td>
                <td className="px-5 py-3 text-white/50">{t.quoteCount}</td>
                <td className="px-5 py-3 text-white/50">{t.memberCount}</td>
                <td className="px-5 py-3 text-white/30 text-xs">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es') : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  <a href={`/admin/tenants/${t.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
