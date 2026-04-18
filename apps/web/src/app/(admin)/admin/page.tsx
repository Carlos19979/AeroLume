import { db, tenants, analyticsEvents, boats, sql, desc, eq } from '@aerolume/db';
import { EVENT_TYPE_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants';
import { formatDateShort, formatDateTime } from '@/lib/format';
import Link from 'next/link';

export default async function AdminOverviewPage() {
  const [tenantCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tenants);
  const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(analyticsEvents);
  const [boatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats);

  // Recent tenants
  const recentTenants = await db
    .select({ id: tenants.id, name: tenants.name, plan: tenants.plan, subscriptionStatus: tenants.subscriptionStatus, createdAt: tenants.createdAt })
    .from(tenants)
    .orderBy(desc(tenants.createdAt))
    .limit(5);

  // Recent users (from auth.users)
  const recentUsers = await db.execute(sql`
    SELECT id, email, raw_user_meta_data->>'full_name' as full_name, created_at
    FROM auth.users ORDER BY created_at DESC LIMIT 5
  `) as { id: string; email: string; full_name: string | null; created_at: string }[];

  // Recent events
  const recentEvents = await db
    .select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      boatModel: analyticsEvents.boatModel,
      tenantName: tenants.name,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .leftJoin(tenants, eq(analyticsEvents.tenantId, tenants.id))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(8);


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/admin/tenants" className="rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-2xl font-bold text-gray-900">{tenantCount?.count ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Tenants</p>
          <div className="mt-3 h-1 rounded-full bg-gray-100">
            <div className="h-1 rounded-full bg-blue-500" style={{ width: '60%' }} />
          </div>
        </Link>
        <a href="/admin/logs" className="rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-2xl font-bold text-gray-900">{eventCount?.count ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Eventos</p>
          <div className="mt-3 h-1 rounded-full bg-gray-100">
            <div className="h-1 rounded-full bg-violet-500" style={{ width: '60%' }} />
          </div>
        </a>
        <a href="/admin/boats" className="rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-2xl font-bold text-gray-900">{boatCount?.count ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Barcos</p>
          <div className="mt-3 h-1 rounded-full bg-gray-100">
            <div className="h-1 rounded-full bg-pink-500" style={{ width: '60%' }} />
          </div>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tenants */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Ultimos tenants</h3>
            <Link href="/admin/tenants" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTenants.map((t) => (
              <a key={t.id} href={`/admin/tenants/${t.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.createdAt ? formatDateShort(t.createdAt) : '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${(SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.canceled).bg} ${(SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.canceled).color}`}>
                    {(SUBSCRIPTION_STATUS_LABELS[t.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.canceled).label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.plan}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Ultimos usuarios</h3>
            <a href="/admin/users" className="text-xs text-blue-600 hover:underline">Ver todos</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.full_name || u.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <p className="text-xs text-gray-500">{u.created_at ? formatDateShort(u.created_at) : '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Actividad reciente</h3>
          <a href="/admin/logs" className="text-xs text-blue-600 hover:underline">Ver todo</a>
        </div>
        <div className="divide-y divide-gray-50">
          {recentEvents.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-2.5">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  e.eventType === 'quote_created' ? 'bg-green-50 text-green-600' :
                  e.eventType === 'boat_selected' ? 'bg-blue-50 text-blue-600' :
                  e.eventType === 'product_selected' ? 'bg-violet-50 text-violet-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {EVENT_TYPE_LABELS[e.eventType] || e.eventType}
                </span>
                {e.boatModel && <span className="text-xs text-gray-500">{e.boatModel}</span>}
              </div>
              <div className="flex items-center gap-3">
                {e.tenantName && <span className="text-xs text-gray-500">{e.tenantName}</span>}
                <span className="text-xs text-gray-500">{e.createdAt ? formatDateTime(e.createdAt) : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
