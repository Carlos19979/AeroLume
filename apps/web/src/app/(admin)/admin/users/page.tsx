import { db, tenantMembers, tenants, eq, sql } from '@aerolume/db';

export default async function AdminUsersPage() {
  // Get all users from auth.users via raw SQL
  const usersResult = await db.execute(sql`
    SELECT au.id, au.email, au.created_at, au.email_confirmed_at, au.raw_user_meta_data->>'full_name' as full_name
    FROM auth.users au
    ORDER BY au.created_at DESC
  `);

  const users = (usersResult as any[]);

  // Get memberships
  const members = await db
    .select({
      userId: tenantMembers.userId,
      role: tenantMembers.role,
      tenantId: tenantMembers.tenantId,
      tenantName: tenants.name,
    })
    .from(tenantMembers)
    .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id));

  // Build user list with memberships
  const userList = users.map((u: any) => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    confirmed: !!u.email_confirmed_at,
    createdAt: u.created_at,
    memberships: members.filter((m) => m.userId === u.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Usuarios</h2>
        <span className="text-xs text-white/30">{userList.length} total</span>
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-white/30 border-b border-white/[0.04]">
              <th className="text-left px-5 py-3">Usuario</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Verificado</th>
              <th className="text-left px-5 py-3">Tenant(s)</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {userList.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <p className="text-white/70 font-medium text-xs">{u.fullName || '—'}</p>
                  <p className="text-[10px] text-white/25 font-mono">{u.id.slice(0, 12)}...</p>
                </td>
                <td className="px-5 py-3 text-white/60 text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${u.confirmed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.confirmed ? 'Si' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.memberships.length === 0 ? (
                    <span className="text-xs text-white/20">Sin tenant</span>
                  ) : (
                    u.memberships.map((m: any) => (
                      <a key={m.tenantId} href={`/admin/tenants/${m.tenantId}`} className="text-xs text-blue-400 hover:text-blue-300 block">
                        {m.tenantName}
                      </a>
                    ))
                  )}
                </td>
                <td className="px-5 py-3">
                  {u.memberships.map((m: any) => (
                    <span key={m.tenantId} className={`text-xs px-1.5 py-0.5 rounded block w-fit mb-0.5 ${
                      m.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                      m.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-white/10 text-white/40'
                    }`}>{m.role}</span>
                  ))}
                </td>
                <td className="px-5 py-3 text-white/30 text-xs">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
