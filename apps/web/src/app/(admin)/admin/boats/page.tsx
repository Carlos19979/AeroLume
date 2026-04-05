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
        <h2 className="text-xl font-bold text-white">Barcos</h2>
        <span className="text-xs text-white/30">{totalCount?.count?.toLocaleString('es') ?? 0} total · {globalCount?.count?.toLocaleString('es') ?? 0} globales</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5">
          <p className="text-2xl font-bold text-white">{totalCount?.count?.toLocaleString('es')}</p>
          <p className="text-xs text-white/40 mt-1">Total barcos</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5">
          <p className="text-2xl font-bold text-white">{globalCount?.count?.toLocaleString('es')}</p>
          <p className="text-xs text-white/40 mt-1">Globales (compartidos)</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5">
          <p className="text-2xl font-bold text-white">{((totalCount?.count ?? 0) - (globalCount?.count ?? 0)).toLocaleString('es')}</p>
          <p className="text-xs text-white/40 mt-1">Personalizados (por tenant)</p>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white/80">Ultimos 50 barcos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-white/30 border-b border-white/[0.04]">
              <th className="text-left px-5 py-2">Modelo</th>
              <th className="text-left px-5 py-2">Eslora</th>
              <th className="text-left px-5 py-2">Tipo</th>
              <th className="text-left px-5 py-2">Origen</th>
              <th className="text-left px-5 py-2">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {recentBoats.map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 text-white/70 font-medium">{b.model}</td>
                <td className="px-5 py-2.5 text-white/50">{b.length ? `${b.length}m` : '—'}</td>
                <td className="px-5 py-2.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${b.isMultihull ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/40'}`}>
                    {b.isMultihull ? 'Multi' : 'Mono'}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-white/30 text-xs">
                  {b.tenantId ? 'Personalizado' : 'Global'}
                </td>
                <td className="px-5 py-2.5 text-white/30 text-xs">
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
