import { db, tenants, analyticsEvents, boats, sql } from '@aerolume/db';

export default async function AdminOverviewPage() {
  const [tenantCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tenants);
  const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(analyticsEvents);
  const [boatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats);

  const stats = [
    { label: 'Tenants', value: tenantCount?.count ?? 0, color: '#3b82f6' },
    { label: 'Eventos', value: eventCount?.count ?? 0, color: '#8b5cf6' },
    { label: 'Barcos', value: boatCount?.count ?? 0, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Overview</h2>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString('es')}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            <div className="mt-3 h-1 rounded-full bg-gray-100">
              <div className="h-1 rounded-full" style={{ backgroundColor: stat.color, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
