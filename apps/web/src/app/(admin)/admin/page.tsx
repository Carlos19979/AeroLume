import { db, tenants, quotes, analyticsEvents, boats, sql, desc } from '@aerolume/db';

export default async function AdminOverviewPage() {
  const [tenantCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tenants);
  const [quoteCount] = await db.select({ count: sql<number>`count(*)::int` }).from(quotes);
  const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(analyticsEvents);
  const [boatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats);

  const recentQuotes = await db
    .select({
      id: quotes.id,
      boatModel: quotes.boatModel,
      customerName: quotes.customerName,
      status: quotes.status,
      tenantId: quotes.tenantId,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .orderBy(desc(quotes.createdAt))
    .limit(10);

  const stats = [
    { label: 'Tenants', value: tenantCount?.count ?? 0, color: '#3b82f6' },
    { label: 'Quotes', value: quoteCount?.count ?? 0, color: '#10b981' },
    { label: 'Eventos', value: eventCount?.count ?? 0, color: '#8b5cf6' },
    { label: 'Barcos', value: boatCount?.count ?? 0, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString('es')}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            <div className="mt-3 h-1 rounded-full bg-gray-100">
              <div className="h-1 rounded-full" style={{ backgroundColor: stat.color, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Quotes recientes (global)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-2">Cliente</th>
              <th className="text-left px-5 py-2">Barco</th>
              <th className="text-left px-5 py-2">Estado</th>
              <th className="text-left px-5 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentQuotes.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-700">{q.customerName || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{q.boatModel || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    q.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {q.createdAt ? new Date(q.createdAt).toLocaleDateString('es') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
