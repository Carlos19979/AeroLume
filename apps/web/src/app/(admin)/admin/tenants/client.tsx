'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

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


export function TenantsClient({ tenants }: { tenants: TenantRow[] }) {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const plans = [...new Set(tenants.map((t) => t.plan).filter(Boolean))] as string[];
  const statuses = [...new Set(tenants.map((t) => t.subscriptionStatus).filter(Boolean))] as string[];
  const cities = [...new Set(tenants.map((t) => [t.city, t.country].filter(Boolean).join(', ')).filter((c) => c.length > 0))].sort();

  let filtered = tenants;

  if (search.length >= 2) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) =>
      (t.companyName || t.name).toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.city || '').toLowerCase().includes(q) ||
      (t.country || '').toLowerCase().includes(q) ||
      (t.phone || '').includes(q) ||
      (t.website || '').toLowerCase().includes(q)
    );
  }
  if (filterPlan !== 'all') filtered = filtered.filter((t) => t.plan === filterPlan);
  if (filterStatus !== 'all') filtered = filtered.filter((t) => t.subscriptionStatus === filterStatus);
  if (filterCity !== 'all') filtered = filtered.filter((t) => [t.city, t.country].filter(Boolean).join(', ') === filterCity);

  const activeFilters = [filterPlan, filterStatus, filterCity].filter((f) => f !== 'all').length;

  function clearFilters() {
    setFilterPlan('all'); setFilterStatus('all'); setFilterCity('all'); setSearch('');
  }

  return (
    <div className="space-y-4">
      {/* Search + filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad, web..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
            showFilters || activeFilters > 0
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-blue-50'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter size={14} />
          Filtros
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] flex items-center justify-center font-medium">
              {activeFilters}
            </span>
          )}
        </button>
        {activeFilters > 0 && (
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700">
            Limpiar
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} de {tenants.length}</span>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Plan</label>
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
              <option value="all">Todos</option>
              {plans.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
              <option value="all">Todos</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ubicacion</label>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
              <option value="all">Todas</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500 text-center">No hay tenants que coincidan con los filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Empresa</th>
                  <th className="text-left px-5 py-3 font-medium">Telefono</th>
                  <th className="text-left px-5 py-3 font-medium">Web</th>
                  <th className="text-left px-5 py-3 font-medium">Ubicacion</th>
                  <th className="text-left px-5 py-3 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 font-medium">Estado</th>
                  <th className="text-left px-5 py-3 font-medium">Quotes</th>
                  <th className="text-left px-5 py-3 font-medium">Miembros</th>
                  <th className="text-left px-5 py-3 font-medium">Registro</th>
                  <th className="text-right px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="text-gray-800 font-medium">{t.companyName || t.name}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{t.phone || '—'}</td>
                    <td className="px-5 py-3 text-xs">
                      {t.website ? (
                        <a href={t.website.startsWith('http') ? t.website : `https://${t.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t.website}</a>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {[t.city, t.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.plan || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${(SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.canceled).bg} ${(SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.canceled).color}`}>
                        {(SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.canceled).label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{t.quoteCount}</td>
                    <td className="px-5 py-3 text-gray-600">{t.memberCount}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {t.createdAt ? formatDate(t.createdAt) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a href={`/admin/tenants/${t.id}`} className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
