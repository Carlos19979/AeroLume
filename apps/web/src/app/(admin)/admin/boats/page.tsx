import { db, boats, sql, desc } from '@aerolume/db';
import { BoatsAdminClient } from './client';

export default async function AdminBoatsPage() {
  const [totalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats);
  const [globalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(boats).where(sql`${boats.tenantId} IS NULL`);

  const recentBoats = await db
    .select({
      id: boats.id,
      model: boats.model,
      boatModel: boats.boatModel,
      length: boats.length,
      isMultihull: boats.isMultihull,
      tenantId: boats.tenantId,
      i: boats.i,
      j: boats.j,
      p: boats.p,
      e: boats.e,
      createdAt: boats.createdAt,
    })
    .from(boats)
    .orderBy(desc(boats.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Barcos</h2>
        <span className="text-xs text-gray-500">{totalCount?.count?.toLocaleString('es') ?? 0} total · {globalCount?.count?.toLocaleString('es') ?? 0} globales</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{totalCount?.count?.toLocaleString('es')}</p>
          <p className="text-xs text-gray-500 mt-1">Total barcos</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{globalCount?.count?.toLocaleString('es')}</p>
          <p className="text-xs text-gray-500 mt-1">Globales</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{((totalCount?.count ?? 0) - (globalCount?.count ?? 0)).toLocaleString('es')}</p>
          <p className="text-xs text-gray-500 mt-1">Personalizados</p>
        </div>
      </div>

      <BoatsAdminClient initialBoats={recentBoats} />
    </div>
  );
}
