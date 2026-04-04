import { db, analyticsEvents, quotes, tenants, eq, desc, sql } from '@aerolume/db';

export default async function AdminLogsPage() {
  const recentEvents = await db
    .select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      boatModel: analyticsEvents.boatModel,
      tenantId: analyticsEvents.tenantId,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(50);

  const recentQuotes = await db
    .select({
      id: quotes.id,
      boatModel: quotes.boatModel,
      customerName: quotes.customerName,
      customerEmail: quotes.customerEmail,
      status: quotes.status,
      tenantId: quotes.tenantId,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .orderBy(desc(quotes.createdAt))
    .limit(20);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white">Actividad</h2>

      {/* Recent quotes */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white/80">Quotes recientes</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/25 border-b border-white/[0.04]">
              <th className="text-left px-5 py-2">Cliente</th>
              <th className="text-left px-5 py-2">Email</th>
              <th className="text-left px-5 py-2">Barco</th>
              <th className="text-left px-5 py-2">Estado</th>
              <th className="text-left px-5 py-2">Tenant</th>
              <th className="text-left px-5 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {recentQuotes.map((q) => (
              <tr key={q.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-white/60">{q.customerName || '—'}</td>
                <td className="px-5 py-2.5 text-white/40">{q.customerEmail || '—'}</td>
                <td className="px-5 py-2.5 text-white/40">{q.boatModel || '—'}</td>
                <td className="px-5 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded ${
                    q.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    q.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-white/10 text-white/30'
                  }`}>{q.status}</span>
                </td>
                <td className="px-5 py-2.5 text-white/25 font-mono">{q.tenantId.slice(0, 8)}</td>
                <td className="px-5 py-2.5 text-white/25">{q.createdAt ? new Date(q.createdAt).toLocaleString('es') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent events */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white/80">Eventos del widget ({recentEvents.length})</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-white/[0.04]">
              {recentEvents.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-2 text-white/50">{e.eventType}</td>
                  <td className="px-5 py-2 text-white/30">{e.boatModel || '—'}</td>
                  <td className="px-5 py-2 text-white/20 font-mono">{e.tenantId.slice(0, 8)}</td>
                  <td className="px-5 py-2 text-white/20">{e.createdAt ? new Date(e.createdAt).toLocaleString('es') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
