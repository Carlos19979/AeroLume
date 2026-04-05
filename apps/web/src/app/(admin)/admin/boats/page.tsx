import { db, boats, sql, desc } from '@aerolume/db';

export default async function AdminBoatsPage() {
  const [totalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats);
  const [globalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats).where(sql`${boats.tenantId} IS NULL`);

  const recentBoats = await db
    .select({
      id: boats.id,
      model: boats.model,
      length: boats.length,
      isMultihull: boats.isMultihull,
      tenantId: boats.tenantId,
      createdAt: boats.createdAt,
    })
    .from(boats)
    .orderBy(desc(boats.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Barcos</h2>
        <span className="text-xs text-gray-400">{totalCount?.count?.toLocaleString('es') ?? 0} total · {globalCount?.count?.toLocaleString('es') ?? 0} globales</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{totalCount?.count?.toLocaleString('es')}</p>
          <p className="text-xs text-gray-400 mt-1">Total barcos</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{globalCount?.count?.toLocaleString('es')}</p>
          <p className="text-xs text-gray-400 mt-1">Globales (compartidos)</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{((totalCount?.count ?? 0) - (globalCount?.count ?? 0)).toLocaleString('es')}</p>
          <p className="text-xs text-gray-400 mt-1">Personalizados (por tenant)</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Ultimos 50 barcos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-2">Modelo</th>
              <th className="text-left px-5 py-2">Eslora</th>
              <th className="text-left px-5 py-2">Tipo</th>
              <th className="text-left px-5 py-2">Origen</th>
              <th className="text-left px-5 py-2">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentBoats.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-5 py-2.5 text-gray-700 font-medium">{b.model}</td>
                <td className="px-5 py-2.5 text-gray-500">{b.length ? `${b.length}m` : '—'}</td>
                <td className="px-5 py-2.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${b.isMultihull ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isMultihull ? 'Multi' : 'Mono'}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-gray-400 text-xs">
                  {b.tenantId ? 'Personalizado' : 'Global'}
                </td>
                <td className="px-5 py-2.5 text-gray-400 text-xs">
                  {b.createdAt ? new Date(b.createdAt).toLocaleDateString('es') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
