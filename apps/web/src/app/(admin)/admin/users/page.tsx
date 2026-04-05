import { db, tenantMembers, tenants, eq, sql } from '@aerolume/db';
import { formatDate } from '@/lib/format';

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
        <h2 className="text-xl font-bold text-gray-900">Usuarios</h2>
        <span className="text-xs text-gray-400">{userList.length} total</span>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-3">Usuario</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Verificado</th>
              <th className="text-left px-5 py-3">Tenant(s)</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {userList.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-gray-700 font-medium text-xs">{u.fullName || '—'}</p>
                  <p className="text-[10px] text-gray-300 font-mono">{u.id.slice(0, 12)}...</p>
                </td>
                <td className="px-5 py-3 text-gray-600 text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${u.confirmed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.confirmed ? 'Si' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.memberships.length === 0 ? (
                    <span className="text-xs text-gray-300">Sin tenant</span>
                  ) : (
                    u.memberships.map((m: any) => (
                      <a key={m.tenantId} href={`/admin/tenants/${m.tenantId}`} className="text-xs text-blue-600 hover:text-blue-500 block">
                        {m.tenantName}
                      </a>
                    ))
                  )}
                </td>
                <td className="px-5 py-3">
                  {u.memberships.map((m: any) => (
                    <span key={m.tenantId} className={`text-xs px-1.5 py-0.5 rounded block w-fit mb-0.5 ${
                      m.role === 'owner' ? 'bg-amber-100 text-amber-700' :
                      m.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{m.role}</span>
                  ))}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {u.createdAt ? formatDate(u.createdAt) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
