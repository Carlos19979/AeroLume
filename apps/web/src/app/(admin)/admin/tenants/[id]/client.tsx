'use client';

import { useState } from 'react';

type Tenant = { [key: string]: any };
type Member = { id: string; userId: string; role: string; [key: string]: any };
type QuoteRow = { id: string; boatModel: string | null; customerName: string | null; status: string; createdAt: Date | null };
type ApiKeyRow = { id: string; keyPrefix: string; name: string; createdAt: Date | null };

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  trialing: 'bg-yellow-500/20 text-yellow-400',
  past_due: 'bg-red-500/20 text-red-400',
  canceled: 'bg-white/10 text-white/40',
};

export function TenantDetailClient({ tenant, members, quotes, apiKeys }: {
  tenant: Tenant;
  members: Member[];
  quotes: QuoteRow[];
  apiKeys: ApiKeyRow[];
}) {
  const [updating, setUpdating] = useState(false);

  async function updatePlan(plan: string) {
    setUpdating(true);
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    window.location.reload();
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionStatus: status }),
    });
    window.location.reload();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Impersonate */}
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">Impersonar tenant</p>
            <p className="text-xs text-blue-300/50 mt-0.5">Abre el dashboard en una nueva pestaña como si fueras este tenant</p>
          </div>
          <a
            href={`/api/admin/impersonate?tenantId=${tenant.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-400 transition-colors"
          >
            Abrir en nueva pestaña
          </a>
        </div>

        {/* Quotes */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white/80">Quotes ({quotes.length})</h3>
          </div>
          {quotes.length === 0 ? (
            <p className="px-5 py-6 text-xs text-white/30">Sin quotes</p>
          ) : (
            <table className="w-full text-xs">
              <tbody className="divide-y divide-white/[0.04]">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 text-white/70">{q.customerName || '—'}</td>
                    <td className="px-5 py-2.5 text-white/40">{q.boatModel || '—'}</td>
                    <td className="px-5 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        q.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        q.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/10 text-white/30'
                      }`}>{q.status}</span>
                    </td>
                    <td className="px-5 py-2.5 text-white/30">{q.createdAt ? new Date(q.createdAt).toLocaleDateString('es') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Info */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Detalles</h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-white/30">Slug</dt><dd className="text-white/60 font-mono">{tenant.slug}</dd></div>
            <div className="flex justify-between"><dt className="text-white/30">Plan</dt><dd className="text-white/60">{tenant.plan}</dd></div>
            <div className="flex justify-between"><dt className="text-white/30">Estado</dt>
              <dd><span className={`px-1.5 py-0.5 rounded ${STATUS_COLORS[tenant.subscriptionStatus] || STATUS_COLORS.canceled}`}>{tenant.subscriptionStatus}</span></dd>
            </div>
            <div className="flex justify-between"><dt className="text-white/30">Creado</dt><dd className="text-white/60">{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('es') : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-white/30">ID</dt><dd className="text-white/30 font-mono text-[10px]">{tenant.id.slice(0, 12)}...</dd></div>
          </dl>
        </div>

        {/* Plan actions */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Cambiar plan</h3>
          <div className="space-y-1.5">
            {['starter', 'pro', 'enterprise'].map((plan) => (
              <button
                key={plan}
                onClick={() => updatePlan(plan)}
                disabled={updating || tenant.plan === plan}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  tenant.plan === plan ? 'bg-white/10 text-white/70 font-medium' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                } disabled:opacity-50`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)} {tenant.plan === plan && '(actual)'}
              </button>
            ))}
          </div>
        </div>

        {/* Status actions */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Cambiar estado</h3>
          <div className="space-y-1.5">
            {['active', 'trialing', 'past_due', 'canceled'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={updating || tenant.subscriptionStatus === status}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  tenant.subscriptionStatus === status ? 'bg-white/10 text-white/70 font-medium' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                } disabled:opacity-50`}
              >
                {status} {tenant.subscriptionStatus === status && '(actual)'}
              </button>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Miembros ({members.length})</h3>
          {members.map((m) => (
            <div key={m.id} className="flex justify-between text-xs">
              <span className="text-white/40 font-mono text-[10px]">{m.userId.slice(0, 8)}...</span>
              <span className="text-white/60">{m.role}</span>
            </div>
          ))}
        </div>

        {/* API Keys */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">API Keys ({apiKeys.length})</h3>
          {apiKeys.map((k) => (
            <div key={k.id} className="flex justify-between text-xs">
              <span className="text-white/50 font-mono">{k.keyPrefix}...</span>
              <span className="text-white/30">{k.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
