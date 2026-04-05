'use client';

import { useState } from 'react';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  companyName: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  plan: string | null;
  subscriptionStatus: string | null;
  createdAt: Date | null;
  quoteCount: number;
  memberCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  past_due: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
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
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
      />

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-5 py-3">Plan</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="text-left px-5 py-3">Quotes</th>
              <th className="text-left px-5 py-3">Miembros</th>
              <th className="text-left px-5 py-3">Creado</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-gray-800 font-medium">{t.companyName || t.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {[t.city, t.country].filter(Boolean).join(', ') || t.slug}
                  </p>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{t.plan || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.subscriptionStatus || ''] || STATUS_COLORS.canceled}`}>
                    {t.subscriptionStatus || '—'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{t.quoteCount}</td>
                <td className="px-5 py-3 text-gray-500">{t.memberCount}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es') : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  <a href={`/admin/tenants/${t.id}`} className="text-xs text-blue-600 hover:text-blue-500">
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
