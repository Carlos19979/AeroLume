import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, idle_timeout: 5 });
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const tenants = await sql<{ id: string; name: string; slug: string; plan: string; created_at: Date }[]>`
    SELECT id, name, slug, plan, created_at
    FROM tenants
    ORDER BY created_at ASC
  `;

  console.log(`Total tenants: ${tenants.length}`);
  for (const t of tenants) {
    const members = await sql<{ user_id: string; role: string }[]>`
      SELECT user_id, role FROM tenant_members WHERE tenant_id = ${t.id}::uuid
    `;
    const quotesCount = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM quotes WHERE tenant_id = ${t.id}::uuid
    `;

    console.log(`\nTenant: ${t.name} (${t.slug}) | plan=${t.plan} | created=${t.created_at.toISOString().slice(0, 10)}`);
    console.log(`  id: ${t.id}`);
    console.log(`  quotes: ${quotesCount[0].count}`);
    console.log(`  members:`);
    for (const m of members) {
      const u = await s.auth.admin.getUserById(m.user_id);
      const email = u.data.user?.email ?? '(deleted user)';
      console.log(`    - ${email} | ${m.role}`);
    }
  }

  await sql.end({ timeout: 1 });
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
