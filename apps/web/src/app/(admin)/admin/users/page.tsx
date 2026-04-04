import { db, tenantMembers, tenants, eq, sql } from '@aerolume/db';

export default async function AdminUsersPage() {
  const members = await db
    .select({
      id: tenantMembers.id,
      userId: tenantMembers.userId,
      role: tenantMembers.role,
      tenantId: tenantMembers.tenantId,
      tenantName: tenants.name,
      tenantSlug: tenants.slug,
      createdAt: tenantMembers.createdAt,
    })
    .from(tenantMembers)
    .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Usuarios</h2>
        <span className="text-xs text-white/30">{members.length} total</span>
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-white/30 border-b border-white/[0.04]">
              <th className="text-left px-5 py-3">User ID</th>
              <th className="text-left px-5 py-3">Tenant</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-white/50 font-mono text-xs">{m.userId.slice(0, 12)}...</td>
                <td className="px-5 py-3">
                  <a href={`/admin/tenants/${m.tenantId}`} className="text-blue-400 hover:text-blue-300 text-xs">
                    {m.tenantName}
                  </a>
                  <p className="text-[10px] text-white/25 font-mono">{m.tenantSlug}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                    m.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-white/10 text-white/40'
                  }`}>{m.role}</span>
                </td>
                <td className="px-5 py-3 text-white/30 text-xs">
                  {m.createdAt ? new Date(m.createdAt).toLocaleDateString('es') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
