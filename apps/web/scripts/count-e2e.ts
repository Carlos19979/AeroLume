import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, idle_timeout: 5 });
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Count e2e users in auth
  let totalUsers = 0;
  let e2eUsers = 0;
  for (let page = 1; page < 50; page++) {
    const { data } = await s.auth.admin.listUsers({ page, perPage: 200 });
    if (!data.users.length) break;
    totalUsers += data.users.length;
    e2eUsers += data.users.filter((u) => u.email?.toLowerCase().startsWith('e2e-')).length;
  }
  console.log(`auth.users — total: ${totalUsers}, e2e-* prefix: ${e2eUsers}`);

  // Count e2e tenants by name pattern
  const tenantCount = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM tenants`;
  const e2eTenantCount = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenants
    WHERE name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%'
  `;
  console.log(`tenants — total: ${tenantCount[0].count}, e2e-* (by name/slug): ${e2eTenantCount[0].count}`);

  // Orphan tenants (no member): often left after failed cleanup
  const orphanTenants = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenants t
    WHERE NOT EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = t.id)
  `;
  console.log(`tenants — sin tenant_members (huérfanos): ${orphanTenants[0].count}`);

  // Auth users with NO tenant_member link
  const orphanUsers = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenant_members WHERE tenant_id NOT IN (SELECT id FROM tenants)
  `;
  console.log(`tenant_members — apuntando a tenants borrados: ${orphanUsers[0].count}`);

  await sql.end({ timeout: 1 });
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
