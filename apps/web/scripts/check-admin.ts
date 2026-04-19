import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

const TARGET = 'admin@example.com';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  console.log('Supabase project URL:', url);

  const s = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let u: { id: string; email?: string; created_at?: string } | null = null;
  for (let page = 1; page < 20 && !u; page++) {
    const { data, error } = await s.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      console.error('listUsers error:', error.message);
      process.exit(1);
    }
    u = data.users.find((x) => x.email?.toLowerCase() === TARGET) ?? null;
    if (!data.users.length) break;
  }

  if (!u) {
    console.log('RESULT: NOT_FOUND');
    process.exit(0);
  }

  console.log('RESULT: FOUND');
  console.log('  user_id:', u.id);
  console.log('  created:', u.created_at);

  const sql = postgres(process.env.DATABASE_URL!, { max: 1, idle_timeout: 3 });
  try {
    const rows = await sql<{ id: string; name: string; plan: string; role: string }[]>`
      SELECT t.id, t.name, t.plan, tm.role
      FROM tenant_members tm
      JOIN tenants t ON t.id = tm.tenant_id
      WHERE tm.user_id = ${u.id}::uuid
    `;
    console.log('  tenants linked:', rows.length);
    rows.forEach((r) => console.log('    -', r.id, '|', r.name, '|', r.plan, '|', r.role));

    // Check API keys linked to those tenants
    if (rows.length) {
      const tenantIds = rows.map((r) => r.id);
      const keys = await sql<{ tenant_id: string; key_prefix: string; name: string | null }[]>`
        SELECT tenant_id, key_prefix, name FROM api_keys WHERE tenant_id = ANY(${tenantIds}::uuid[])
      `;
      console.log('  api_keys for these tenants:', keys.length);
      keys.forEach((k) => console.log('    key:', k.key_prefix + '...', '| tenant:', k.tenant_id, '| name:', k.name));

      const demoKey = process.env.NEXT_PUBLIC_DEMO_API_KEY;
      if (demoKey) {
        const demoPrefix = demoKey.slice(0, 11);
        const matches = keys.find((k) => k.key_prefix === demoPrefix);
        console.log('  NEXT_PUBLIC_DEMO_API_KEY prefix:', demoPrefix);
        console.log('  → matches a key in this tenant?', matches ? 'YES — borrar el tenant invalidaría el embed home' : 'NO — safe to delete');
      }
    }

    // Super admin emails check
    const superList = (process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    console.log('  SUPER_ADMIN_EMAILS:', superList);
    console.log('  → admin@example.com is the only super admin?', superList.length === 1 && superList[0] === 'admin@example.com' ? 'YES — te quedarías sin admin' : 'NO — hay más, safe');
  } finally {
    await sql.end({ timeout: 1 });
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
