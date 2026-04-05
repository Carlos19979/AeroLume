import { db, analyticsEvents, quotes, tenants, eq, desc, sql } from '@aerolume/db';

export default async function AdminLogsPage() {
  const recentEvents = await db
    .select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      boatModel: analyticsEvents.boatModel,
      tenantId: analyticsEvents.tenantId,
      tenantName: tenants.name,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .leftJoin(tenants, eq(analyticsEvents.tenantId, tenants.id))
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
      tenantName: tenants.name,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .leftJoin(tenants, eq(quotes.tenantId, tenants.id))
    .orderBy(desc(quotes.createdAt))
    .limit(20);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Actividad</h2>

      {/* Recent quotes */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Quotes recientes</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-2">Cliente</th>
              <th className="text-left px-5 py-2">Email</th>
              <th className="text-left px-5 py-2">Barco</th>
              <th className="text-left px-5 py-2">Estado</th>
              <th className="text-left px-5 py-2">Tenant</th>
              <th className="text-left px-5 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentQuotes.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-5 py-2.5 text-gray-600">{q.customerName || '—'}</td>
                <td className="px-5 py-2.5 text-gray-400">{q.customerEmail || '—'}</td>
                <td className="px-5 py-2.5 text-gray-400">{q.boatModel || '—'}</td>
                <td className="px-5 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded ${
                    q.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{q.status}</span>
                </td>
                <td className="px-5 py-2.5">
                  {q.tenantName ? (
                    <a href={`/admin/tenants/${q.tenantId}`} className="text-blue-600 hover:text-blue-500 font-medium">
                      {q.tenantName}
                    </a>
                  ) : (
                    <span className="text-gray-300 font-mono">{q.tenantId.slice(0, 8)}</span>
                  )}
                </td>
                <td className="px-5 py-2.5 text-gray-300">{q.createdAt ? new Date(q.createdAt).toLocaleString('es') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent events */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Eventos del widget ({recentEvents.length})</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 sticky top-0 bg-white">
                <th className="text-left px-5 py-2">Evento</th>
                <th className="text-left px-5 py-2">Barco</th>
                <th className="text-left px-5 py-2">Tenant</th>
                <th className="text-left px-5 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEvents.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2 text-gray-500">{e.eventType}</td>
                  <td className="px-5 py-2 text-gray-400">{e.boatModel || '—'}</td>
                  <td className="px-5 py-2">
                    {e.tenantName ? (
                      <a href={`/admin/tenants/${e.tenantId}`} className="text-blue-600 hover:text-blue-500 font-medium">
                        {e.tenantName}
                      </a>
                    ) : (
                      <span className="text-gray-300 font-mono">{e.tenantId.slice(0, 8)}</span>
                    )}
                  </td>
                  <td className="px-5 py-2 text-gray-300">{e.createdAt ? new Date(e.createdAt).toLocaleString('es') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
