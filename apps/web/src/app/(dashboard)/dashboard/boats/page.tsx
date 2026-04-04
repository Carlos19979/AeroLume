import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, boats, sql, eq, or } from '@aerolume/db';
import { BoatsClient } from './client';

export default async function BoatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id);
  if (!tenant) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tienes un workspace configurado.
      </div>
    );
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(boats)
    .where(or(eq(boats.tenantId, tenant.id), sql`${boats.tenantId} IS NULL`));

  const list = await db
    .select({
      id: boats.id,
      model: boats.model,
      boatModel: boats.boatModel,
      length: boats.length,
      isMultihull: boats.isMultihull,
      tenantId: boats.tenantId,
    })
    .from(boats)
    .where(or(eq(boats.tenantId, tenant.id), sql`${boats.tenantId} IS NULL`))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Barcos</h2>
        <p className="text-gray-500 mt-1">
          Base de datos de barcos disponibles en tu configurador.
          {' '}{countResult?.count?.toLocaleString('es')} barcos en total.
        </p>
      </div>
      <BoatsClient initialBoats={list} totalCount={countResult?.count ?? 0} />
    </div>
  );
}
