import { db, tenants, quotes, products, analyticsEvents, boats, sql, desc } from '@aerolume/db';

export default async function AdminOverviewPage() {
  const [tenantCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tenants);
  const [quoteCount] = await db.select({ count: sql<number>`count(*)::int` }).from(quotes);
  const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
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
    { label: 'Productos', value: productCount?.count ?? 0, color: '#f59e0b' },
    { label: 'Eventos', value: eventCount?.count ?? 0, color: '#8b5cf6' },
    { label: 'Barcos', value: boatCount?.count ?? 0, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white">Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5">
            <p className="text-2xl font-bold text-white">{stat.value.toLocaleString('es')}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            <div className="mt-3 h-1 rounded-full bg-white/[0.06]">
              <div className="h-1 rounded-full" style={{ backgroundColor: stat.color, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white/80">Quotes recientes (global)</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-white/30 border-b border-white/[0.04]">
              <th className="text-left px-5 py-2">Cliente</th>
              <th className="text-left px-5 py-2">Barco</th>
              <th className="text-left px-5 py-2">Estado</th>
              <th className="text-left px-5 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {recentQuotes.map((q) => (
              <tr key={q.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white/70">{q.customerName || '—'}</td>
                <td className="px-5 py-3 text-white/50">{q.boatModel || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    q.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                    q.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/30 text-xs">
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
