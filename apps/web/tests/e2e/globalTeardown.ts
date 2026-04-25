import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const E2E_EMAIL_RE = /^e2e-.*@aerolume\.test$/;

const CHILD_TABLES = [
  'quote_items',
  'quotes',
  'product_pricing_tiers',
  'product_config_fields',
  'products',
  'boats',
  'api_keys',
  'analytics_events',
  'tenant_members',
] as const;

async function deleteTenantTrees(
  sql: postgres.Sql,
  tenantIds: string[],
  label: string,
): Promise<void> {
  const productSubquery = `SELECT id FROM products WHERE tenant_id = ANY($1::uuid[])`;
  const quoteSubquery = `SELECT id FROM quotes WHERE tenant_id = ANY($1::uuid[])`;

  const deleteMap: Record<string, string> = {
    quote_items: `DELETE FROM quote_items WHERE quote_id IN (${quoteSubquery})`,
    product_pricing_tiers: `DELETE FROM product_pricing_tiers WHERE product_id IN (${productSubquery})`,
    product_config_fields: `DELETE FROM product_config_fields WHERE product_id IN (${productSubquery})`,
  };

  for (const table of CHILD_TABLES) {
    try {
      const query = deleteMap[table] ?? `DELETE FROM "${table}" WHERE tenant_id = ANY($1::uuid[])`;
      await sql.unsafe(query, [tenantIds]);
    } catch (err) {
      console.warn(`  ! [${label}] failed to delete from ${table}:`, (err as Error).message);
    }
  }
  try {
    const deleted = await sql<{ count: string }[]>`
      WITH removed AS (
        DELETE FROM tenants WHERE id = ANY(${tenantIds}::uuid[]) RETURNING id
      )
      SELECT COUNT(*)::text AS count FROM removed
    `;
    const count = parseInt(deleted[0]?.count ?? '0', 10);
    if (count > 0) {
      console.log(`[e2e:globalTeardown] [${label}] Deleted ${count} tenant(s) with children.`);
    }
  } catch (err) {
    console.warn(`  ! [${label}] failed to delete tenants:`, (err as Error).message);
  }
}

export default async function globalTeardown(): Promise<void> {
  dotenvConfig({ path: path.resolve(__dirname, '../../.env.local') });

  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const serviceKey = process.env.E2E_SUPABASE_SERVICE_KEY;
  const dbUrl = process.env.E2E_DATABASE_URL;

  if (!supabaseUrl || !serviceKey || !dbUrl) {
     
    console.warn('[e2e:globalTeardown] Missing env vars — skipping cleanup.');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const sql = postgres(dbUrl, { max: 1, idle_timeout: 2 });

  try {
    // Paginate users and filter by email regex
    const e2eUsers: Array<{ id: string; email: string }> = [];
    let page = 1;
    const perPage = 200;
    // Arbitrary safety cap in case of runaway pagination
    for (let i = 0; i < 20; i++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.warn('[e2e:globalTeardown] listUsers error:', error.message);
        break;
      }
      const users = data?.users ?? [];
      for (const u of users) {
        if (u.email && E2E_EMAIL_RE.test(u.email)) {
          e2eUsers.push({ id: u.id, email: u.email });
        }
      }
      if (users.length < perPage) break;
      page += 1;
    }

    if (e2eUsers.length === 0) {
      console.log('[e2e:globalTeardown] No e2e-* users found in auth.');
    } else {
      console.log(`[e2e:globalTeardown] Found ${e2eUsers.length} e2e user(s) — cleaning up.`);

      // Collect all tenant IDs for per-user cleanup
      const userTenantIds: string[] = [];
      for (const user of e2eUsers) {
        try {
          const tenantRows = await sql<{ tenant_id: string }[]>`
            SELECT tenant_id FROM tenant_members WHERE user_id = ${user.id}::uuid
          `;
          for (const row of tenantRows) {
            userTenantIds.push(row.tenant_id);
          }
        } catch (err) {
          console.warn(`  ! error finding tenants for ${user.email}:`, (err as Error).message);
        }
      }

      // Delete tenant trees in FK-safe order
      if (userTenantIds.length > 0) {
        await deleteTenantTrees(sql, userTenantIds, 'per-user');
      }

      // Delete auth users
      for (const user of e2eUsers) {
        const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
        if (delErr) {
          console.warn(`  ! failed to delete user ${user.email}:`, delErr.message);
        } else {
          console.log(`  - deleted user ${user.email}`);
        }
      }
    }

    // Bulk-delete any remaining e2e-* tenants (catches orphans missed by per-user loop)
    try {
      const orphanRows = await sql<{ id: string }[]>`
        SELECT id::text FROM tenants WHERE name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%'
      `;
      const orphanIds = orphanRows.map((r) => r.id);
      if (orphanIds.length > 0) {
        await deleteTenantTrees(sql, orphanIds, 'bulk-orphan');
      } else {
        console.log('[e2e:globalTeardown] No orphaned e2e tenants found in bulk pass.');
      }
    } catch (err) {
      console.warn('[e2e:globalTeardown] bulk tenant cleanup failed:', (err as Error).message);
    }

    // Defensive: remove any leftover orphaned tenant_members
    try {
      const orphans = await sql<{ count: string }[]>`
        WITH removed AS (
          DELETE FROM tenant_members tm
          WHERE NOT EXISTS (SELECT 1 FROM tenants t WHERE t.id = tm.tenant_id)
          RETURNING tm.id
        )
        SELECT COUNT(*)::text AS count FROM removed
      `;
      const count = parseInt(orphans[0]?.count ?? '0', 10);
      if (count > 0) {
        console.log(`[e2e:globalTeardown] Removed ${count} orphaned tenant_members row(s).`);
      }
    } catch (err) {
      console.warn('[e2e:globalTeardown] orphaned tenant_members cleanup failed:', (err as Error).message);
    }
  } catch (err) {
    console.warn('[e2e:globalTeardown] unexpected error:', (err as Error).message);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}
