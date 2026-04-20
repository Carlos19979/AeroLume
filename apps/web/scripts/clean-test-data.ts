/**
 * clean-test-data.ts
 *
 * Limpieza destructiva de datos de test en la DB de producción:
 *   - Tenants  con name/slug ILIKE 'e2e-%'
 *   - Auth users con email ILIKE 'e2e-%'
 *   - Quotes con customer_email ILIKE 'e2e-%' OR ILIKE '%@aerolume.test'
 *   - Quote_items huérfanos (product_id FK drift)
 *
 * EXCEPCIÓN: El tenant 'aerolume' (real del owner) NO se borra.
 *            Solo se borran sus quotes que matcheen el patrón de test.
 *
 * Uso:
 *   pnpm tsx apps/web/scripts/clean-test-data.ts
 */

import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

config({ path: path.resolve(__dirname, '..', '.env.local') });

// ─── helpers ──────────────────────────────────────────────────────────────────

function n(rows: { count: string }[]): number {
  return Number(rows[0]?.count ?? 0);
}

function heading(s: string) {
  console.log(`\n${'─'.repeat(60)}\n${s}\n${'─'.repeat(60)}`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!dbUrl) { console.error('FATAL: DATABASE_URL not set'); process.exit(1); }
  if (!supabaseUrl) { console.error('FATAL: NEXT_PUBLIC_SUPABASE_URL not set'); process.exit(1); }
  if (!serviceKey) { console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY not set'); process.exit(1); }

  console.log('DB host:', dbUrl.split('@')[1]?.split('/')[0] ?? '(hidden)');
  console.log('Supabase:', supabaseUrl);

  const sql = postgres(dbUrl, { max: 1, idle_timeout: 5 });
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ══════════════════════════════════════════════════════════════════
  // PRE-VUELO (read-only)
  // ══════════════════════════════════════════════════════════════════
  heading('PRE-VUELO — qué se va a borrar');

  // Tenants e2e
  const e2eTenantsCount = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenants
    WHERE (name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%')
      AND slug != 'aerolume'
  `;
  console.log(`  Tenants e2e-* (a borrar):              ${n(e2eTenantsCount)}`);

  // Quotes test (en todos los tenants, incluido aerolume)
  const testQuotesCount = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM quotes
    WHERE customer_email ILIKE 'e2e-%'
       OR customer_email ILIKE '%@aerolume.test'
  `;
  console.log(`  Quotes con email test (a borrar):      ${n(testQuotesCount)}`);

  // Quote_items huérfanos (product_id apunta a producto que ya no existe)
  const orphanItemsCount = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM quote_items
    WHERE product_id IS NOT NULL
      AND product_id NOT IN (SELECT id FROM products)
  `;
  console.log(`  quote_items huérfanos (product_id FK): ${n(orphanItemsCount)}`);

  // Auth users e2e (necesitamos paginar via Supabase Admin API)
  let e2eUserIds: string[] = [];
  {
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) { console.error('Error listando auth.users:', error.message); break; }
      const batch = (data?.users ?? []).filter((u) =>
        u.email?.toLowerCase().startsWith('e2e-')
      );
      e2eUserIds.push(...batch.map((u) => u.id));
      if ((data?.users ?? []).length < perPage) break;
      page++;
    }
  }
  console.log(`  Auth users e2e-* (a borrar):           ${e2eUserIds.length}`);

  // Tenants reales (los que quedarán — verificación visual)
  const realTenants = await sql<{ id: string; name: string; slug: string }[]>`
    SELECT id, name, slug FROM tenants
    WHERE name NOT ILIKE 'e2e-%' AND slug NOT ILIKE 'e2e-%'
    ORDER BY name
  `;
  console.log('\n  Tenants que NO se borrarán:');
  for (const t of realTenants) {
    console.log(`    [${t.id}] ${t.name} (${t.slug})`);
  }

  const nothingToDo =
    n(e2eTenantsCount) === 0 &&
    n(testQuotesCount) === 0 &&
    n(orphanItemsCount) === 0 &&
    e2eUserIds.length === 0;

  if (nothingToDo) {
    console.log('\nNada que borrar. DB está limpia.');
    await sql.end({ timeout: 1 });
    return;
  }

  // ══════════════════════════════════════════════════════════════════
  // BORRADO EN ORDEN (FK-safe)
  // ══════════════════════════════════════════════════════════════════

  // ── PASO 1: Quotes test (cascade borra quote_items asociados) ─────
  heading('PASO 1 — DELETE quotes con email de test');
  const deletedQuotes = await sql<{ id: string }[]>`
    DELETE FROM quotes
    WHERE customer_email ILIKE 'e2e-%'
       OR customer_email ILIKE '%@aerolume.test'
    RETURNING id
  `;
  console.log(`  quotes eliminadas: ${deletedQuotes.length}`);

  // ── PASO 2: quote_items.product_id FK workaround ──────────────────
  // La FK real en DB es RESTRICT (no SET NULL como declara el schema Drizzle).
  // Nulleamos antes de borrar los tenants para evitar FK violation.
  heading('PASO 2 — NULL-out quote_items.product_id para productos e2e (FK workaround)');
  const nulledItems = await sql<{ id: string }[]>`
    UPDATE quote_items
    SET product_id = NULL
    WHERE product_id IN (
      SELECT p.id FROM products p
      JOIN tenants t ON t.id = p.tenant_id
      WHERE (t.name ILIKE 'e2e-%' OR t.slug ILIKE 'e2e-%')
        AND t.slug != 'aerolume'
    )
    RETURNING id
  `;
  console.log(`  quote_items.product_id nulleados: ${nulledItems.length}`);

  // ── PASO 3: DELETE orphan quote_items (product_id FK drift) ───────
  heading('PASO 3 — DELETE quote_items huérfanos (product_id no existe en products)');
  const deletedOrphans = await sql<{ id: string }[]>`
    DELETE FROM quote_items
    WHERE product_id IS NOT NULL
      AND product_id NOT IN (SELECT id FROM products)
    RETURNING id
  `;
  console.log(`  quote_items huérfanos eliminados: ${deletedOrphans.length}`);

  // ── PASO 4: DELETE tenants e2e (cascade: members, products, api_keys, quotes) ─
  heading('PASO 4 — DELETE tenants e2e-* (cascade)');
  const deletedTenants = await sql<{ id: string; name: string }[]>`
    DELETE FROM tenants
    WHERE (name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%')
      AND slug != 'aerolume'
    RETURNING id, name
  `;
  console.log(`  tenants eliminados: ${deletedTenants.length}`);
  for (const t of deletedTenants) {
    console.log(`    ✓ ${t.name} (${t.id})`);
  }

  // ── PASO 5: DELETE auth.users e2e vía Supabase Admin API ──────────
  heading('PASO 5 — DELETE auth.users e2e-*');
  let deletedUsers = 0;
  let failedUsers = 0;
  for (const uid of e2eUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(uid);
    if (error) {
      console.warn(`  WARN: no se pudo borrar user ${uid}: ${error.message}`);
      failedUsers++;
    } else {
      deletedUsers++;
    }
  }
  console.log(`  auth.users eliminados: ${deletedUsers} / ${e2eUserIds.length} (fallos: ${failedUsers})`);

  // ── PASO 6: Defensive cleanup — orphan tenant_members ─────────────
  heading('PASO 6 — DELETE tenant_members huérfanos (defensive)');
  const orphanMembers = await sql<{ tenant_id: string }[]>`
    DELETE FROM tenant_members
    WHERE tenant_id NOT IN (SELECT id FROM tenants)
    RETURNING tenant_id
  `;
  console.log(`  tenant_members huérfanos eliminados: ${orphanMembers.length}`);

  // ── PASO 7: Defensive cleanup — orphan api_keys ───────────────────
  heading('PASO 7 — DELETE api_keys huérfanas (defensive)');
  const orphanKeys = await sql<{ tenant_id: string }[]>`
    DELETE FROM api_keys
    WHERE tenant_id NOT IN (SELECT id FROM tenants)
    RETURNING tenant_id
  `;
  console.log(`  api_keys huérfanas eliminadas: ${orphanKeys.length}`);

  // ══════════════════════════════════════════════════════════════════
  // VERIFICACIÓN POST
  // ══════════════════════════════════════════════════════════════════
  heading('VERIFICACIÓN POST — todos deben ser 0');

  const postTenants = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenants
    WHERE (name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%') AND slug != 'aerolume'
  `;
  const postQuotes = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM quotes
    WHERE customer_email ILIKE 'e2e-%' OR customer_email ILIKE '%@aerolume.test'
  `;
  const postOrphanItems = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM quote_items
    WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM products)
  `;

  // Re-check auth.users e2e
  let remainingE2eUsers = 0;
  {
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) break;
      remainingE2eUsers += (data?.users ?? []).filter((u) =>
        u.email?.toLowerCase().startsWith('e2e-')
      ).length;
      if ((data?.users ?? []).length < perPage) break;
      page++;
    }
  }

  console.log(`  tenants e2e-* restantes:       ${n(postTenants)}   (esperado: 0)`);
  console.log(`  quotes test restantes:          ${n(postQuotes)}   (esperado: 0)`);
  console.log(`  quote_items huérfanos:          ${n(postOrphanItems)}   (esperado: 0)`);
  console.log(`  auth.users e2e-* restantes:     ${remainingE2eUsers}   (esperado: 0)`);

  // Verificar que el tenant Aerolume sigue intacto
  const aeroTenant = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM tenants WHERE slug = 'aerolume'
  `;
  if (aeroTenant.length > 0) {
    console.log(`\n  ✓ Tenant 'Aerolume' INTACTO: [${aeroTenant[0].id}] ${aeroTenant[0].name}`);
  } else {
    console.warn('\n  WARN: Tenant aerolume no encontrado (puede no existir aún)');
  }

  const allOk =
    n(postTenants) === 0 &&
    n(postQuotes) === 0 &&
    n(postOrphanItems) === 0 &&
    remainingE2eUsers === 0;

  await sql.end({ timeout: 1 });

  if (!allOk) {
    console.error('\nPROBLEMA: Algunos conteos post no son 0. Revisar manualmente.');
    process.exit(1);
  }

  console.log('\nDONE — limpieza completa sin errores.');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
