'use client';

import { useState } from 'react';
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

type Tenant = { id: string; name: string; slug: string; plan: string; subscriptionStatus: string; companyName?: string | null; phone?: string | null; website?: string | null; city?: string | null; country?: string | null; createdAt?: Date | null; [key: string]: unknown };
type Member = { id: string; userId: string; role: string };
type QuoteRow = { id: string; boatModel: string | null; customerName: string | null; status: string; createdAt: Date | null };
type ApiKeyRow = { id: string; keyPrefix: string; name: string; createdAt: Date | null };


export function TenantDetailClient({ tenant, members, quotes, apiKeys }: {
  tenant: Tenant;
  members: Member[];
  quotes: QuoteRow[];
  apiKeys: ApiKeyRow[];
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState(tenant);

  async function updatePlan(plan: string) {
    setUpdating(true);
    try {
      setError(null);
      const res = await fetch(`/api/admin/tenants/${tenantData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setTenantData((prev: Tenant) => ({ ...prev, plan }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setUpdating(false);
    }
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      setError(null);
      const res = await fetch(`/api/admin/tenants/${tenantData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionStatus: status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setTenantData((prev: Tenant) => ({ ...prev, subscriptionStatus: status }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Impersonate */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Impersonar tenant</p>
            <p className="text-xs text-blue-500 mt-0.5">Abre el dashboard en una nueva pestaña como si fueras este tenant</p>
          </div>
          <a
            data-testid={`admin-impersonate-${tenantData.id}`}
            href={`/api/admin/impersonate?tenantId=${tenantData.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            Abrir en nueva pestaña
          </a>
        </div>

        {/* Quotes */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Quotes ({quotes.length})</h3>
          </div>
          {quotes.length === 0 ? (
            <p className="px-5 py-6 text-xs text-gray-400">Sin quotes</p>
          ) : (
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-gray-700">{q.customerName || '—'}</td>
                    <td className="px-5 py-2.5 text-gray-400">{q.boatModel || '—'}</td>
                    <td className="px-5 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        q.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{q.status}</span>
                    </td>
                    <td className="px-5 py-2.5 text-gray-400">{q.createdAt ? formatDate(q.createdAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Company info */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Empresa</h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-gray-500">Nombre</dt><dd className="text-gray-700 font-medium">{tenantData.companyName || tenantData.name}</dd></div>
            {tenantData.phone && <div className="flex justify-between"><dt className="text-gray-500">Telefono</dt><dd className="text-gray-700">{tenantData.phone}</dd></div>}
            {tenantData.website && <div className="flex justify-between"><dt className="text-gray-500">Web</dt><dd><a href={tenantData.website.startsWith('http') ? tenantData.website : `https://${tenantData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tenantData.website}</a></dd></div>}
            {(tenantData.city || tenantData.country) && <div className="flex justify-between"><dt className="text-gray-500">Ubicacion</dt><dd className="text-gray-700">{[tenantData.city, tenantData.country].filter(Boolean).join(', ')}</dd></div>}
          </dl>
        </div>

        {/* Details */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Detalles</h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-gray-500">Slug</dt><dd className="text-gray-600 font-mono">{tenantData.slug}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="text-gray-600">{tenantData.plan}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Estado</dt>
              <dd><span className={`px-1.5 py-0.5 rounded ${(SUBSCRIPTION_STATUS_LABELS[tenantData.subscriptionStatus] || SUBSCRIPTION_STATUS_LABELS.canceled).bg} ${(SUBSCRIPTION_STATUS_LABELS[tenantData.subscriptionStatus] || SUBSCRIPTION_STATUS_LABELS.canceled).color}`}>{(SUBSCRIPTION_STATUS_LABELS[tenantData.subscriptionStatus] || SUBSCRIPTION_STATUS_LABELS.canceled).label}</span></dd>
            </div>
            <div className="flex justify-between"><dt className="text-gray-500">Creado</dt><dd className="text-gray-600">{tenantData.createdAt ? formatDate(tenantData.createdAt) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">ID</dt><dd className="text-gray-500 font-mono text-[10px]">{tenantData.id.slice(0, 12)}...</dd></div>
          </dl>
        </div>

        {/* Plan actions */}
        <div data-testid="admin-tenant-plan" className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Cambiar plan</h3>
          <div className="space-y-1.5">
            {['prueba', 'pro'].map((plan) => (
              <button
                key={plan}
                onClick={() => updatePlan(plan)}
                disabled={updating || tenantData.plan === plan}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  tenantData.plan === plan ? 'bg-gray-100 text-gray-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                } disabled:opacity-50`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)} {tenantData.plan === plan && '(actual)'}
              </button>
            ))}
          </div>
        </div>

        {/* Status actions */}
        <div data-testid="admin-tenant-status" className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Cambiar estado</h3>
          <div className="space-y-1.5">
            {['active', 'canceled', 'past_due'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={updating || tenantData.subscriptionStatus === status}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  tenantData.subscriptionStatus === status ? 'bg-gray-100 text-gray-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                } disabled:opacity-50`}
              >
                {status} {tenantData.subscriptionStatus === status && '(actual)'}
              </button>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Miembros ({members.length})</h3>
          {members.map((m) => (
            <div key={m.id} className="flex justify-between text-xs">
              <span className="text-gray-400 font-mono text-[10px]">{m.userId.slice(0, 8)}...</span>
              <span className="text-gray-600">{m.role}</span>
            </div>
          ))}
        </div>

        {/* API Keys */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">API Keys ({apiKeys.length})</h3>
          {apiKeys.map((k) => (
            <div key={k.id} className="flex justify-between text-xs">
              <span className="text-gray-500 font-mono">{k.keyPrefix}...</span>
              <span className="text-gray-400">{k.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
