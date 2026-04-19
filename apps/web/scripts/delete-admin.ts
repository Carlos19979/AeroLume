import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

const TARGET_EMAIL = 'admin@example.com';
const TARGET_USER_ID = 'f425feea-9681-4686-9aa2-16c6b886c4cc';
const TARGET_TENANT_ID = '04ee9784-32a8-416c-be44-652ff63d3ba4';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const dbUrl = process.env.DATABASE_URL!;
  console.log('Supabase project:', supabaseUrl);
  console.log('Target email:', TARGET_EMAIL);
  console.log('Target user_id:', TARGET_USER_ID);
  console.log('Target tenant_id:', TARGET_TENANT_ID);

  const s = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const sql = postgres(dbUrl, { max: 1, idle_timeout: 5 });

  // Re-verify the user/tenant before destructive ops
  const verifyUser = await s.auth.admin.getUserById(TARGET_USER_ID);
  if (verifyUser.error || verifyUser.data.user?.email?.toLowerCase() !== TARGET_EMAIL) {
    console.error('SAFETY: target user does not match email — aborting.');
    process.exit(1);
  }
  console.log('✓ User verified.');

  const tenantRows = await sql<{ id: string }[]>`SELECT id FROM tenants WHERE id = ${TARGET_TENANT_ID}::uuid`;
  if (tenantRows.length !== 1) {
    console.error('SAFETY: tenant not found — aborting.');
    process.exit(1);
  }
  console.log('✓ Tenant verified.');

  console.log('\n--- step 1: delete tenant (cascade cleans tenant_members, products, quotes, api_keys) ---');
  const delTenant = await sql`DELETE FROM tenants WHERE id = ${TARGET_TENANT_ID}::uuid RETURNING id`;
  console.log('  deleted tenants rows:', delTenant.length);

  console.log('\n--- step 2: delete orphan tenant_members (defensive — should be cascade already) ---');
  const delMembers = await sql`DELETE FROM tenant_members WHERE user_id = ${TARGET_USER_ID}::uuid RETURNING user_id`;
  console.log('  deleted tenant_members rows:', delMembers.length);

  console.log('\n--- step 3: delete auth user ---');
  const delUser = await s.auth.admin.deleteUser(TARGET_USER_ID);
  if (delUser.error) {
    console.error('FATAL: failed to delete auth user:', delUser.error.message);
    process.exit(1);
  }
  console.log('  ✓ auth.users row deleted');

  console.log('\n--- verification ---');
  const stillThere = await s.auth.admin.getUserById(TARGET_USER_ID);
  if (stillThere.data.user) {
    console.error('PROBLEM: user still exists after delete!');
    process.exit(1);
  }
  console.log('  ✓ user no longer in auth.users');

  const tenantStill = await sql<{ id: string }[]>`SELECT id FROM tenants WHERE id = ${TARGET_TENANT_ID}::uuid`;
  console.log('  ✓ tenant rows remaining:', tenantStill.length);

  await sql.end({ timeout: 1 });
  console.log('\nDONE — admin@example.com fully removed from production.');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
