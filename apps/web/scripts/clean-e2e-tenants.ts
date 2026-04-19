import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl) {
    console.error('FATAL: DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  console.log('Project DB:', dbUrl.split('@')[1]?.split('/')[0] ?? '(hidden)');

  const sql = postgres(dbUrl, { max: 1, idle_timeout: 5 });

  // --- PRE-FLIGHT ---
  console.log('\n--- pre-vuelo ---');

  const totalBefore = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM tenants`;
  const e2eCount = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenants
    WHERE name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%'
  `;
  const realCount = Number(totalBefore[0].count) - Number(e2eCount[0].count);

  console.log(`  tenants total: ${totalBefore[0].count}`);
  console.log(`  tenants e2e-* (a borrar): ${e2eCount[0].count}`);
  console.log(`  tenants reales (quedarán): ${realCount}`);

  // Safety: if real count looks suspicious, stop.
  if (realCount < 0) {
    console.error('SAFETY: real tenant count is negative — aborting.');
    await sql.end({ timeout: 1 });
    process.exit(1);
  }

  // Show the real tenants so the operator can verify them visually
  const realTenants = await sql<{ id: string; name: string; slug: string }[]>`
    SELECT id, name, slug FROM tenants
    WHERE name NOT ILIKE 'e2e-%' AND slug NOT ILIKE 'e2e-%'
    ORDER BY name
  `;
  console.log('\n  Tenants que NO se borrarán:');
  for (const t of realTenants) {
    console.log(`    [${t.id}] ${t.name} (${t.slug})`);
  }

  if (Number(e2eCount[0].count) === 0) {
    console.log('\nNada que borrar. Saliendo.');
    await sql.end({ timeout: 1 });
    return;
  }

  // --- DELETE E2E TENANTS ---
  // quote_items.product_id FK is RESTRICT in DB (not SET NULL as schema intends),
  // so we must null it out / delete quote_items before products are cascade-deleted.
  console.log('\n--- step 1a: NULL-out quote_items.product_id for e2e products (FK workaround) ---');
  const nulledItems = await sql<{ id: string }[]>`
    UPDATE quote_items
    SET product_id = NULL
    WHERE product_id IN (
      SELECT p.id FROM products p
      JOIN tenants t ON t.id = p.tenant_id
      WHERE t.name ILIKE 'e2e-%' OR t.slug ILIKE 'e2e-%'
    )
    RETURNING id
  `;
  console.log(`  nulled product_id en quote_items: ${nulledItems.length}`);

  console.log('\n--- step 1b: DELETE tenants e2e-* (cascade removes tenant_members, products, quotes, api_keys) ---');
  const deleted = await sql<{ id: string }[]>`
    DELETE FROM tenants
    WHERE name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%'
    RETURNING id
  `;
  console.log(`  eliminados: ${deleted.length} tenant(s)`);

  // --- DEFENSIVE CLEANUP: orphan tenant_members ---
  console.log('\n--- step 2: DELETE tenant_members huérfanos (defensive) ---');
  const orphanMembers = await sql<{ tenant_id: string }[]>`
    DELETE FROM tenant_members
    WHERE tenant_id NOT IN (SELECT id FROM tenants)
    RETURNING tenant_id
  `;
  console.log(`  eliminados: ${orphanMembers.length} tenant_members huérfanos`);

  // --- DEFENSIVE CLEANUP: orphan api_keys ---
  console.log('\n--- step 3: DELETE api_keys huérfanas (defensive) ---');
  const orphanKeys = await sql<{ tenant_id: string }[]>`
    DELETE FROM api_keys
    WHERE tenant_id NOT IN (SELECT id FROM tenants)
    RETURNING tenant_id
  `;
  console.log(`  eliminadas: ${orphanKeys.length} api_keys huérfanas`);

  // --- POST VERIFICATION ---
  console.log('\n--- verificación post ---');
  const totalAfter = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM tenants`;
  const e2eAfter = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tenants
    WHERE name ILIKE 'e2e-%' OR slug ILIKE 'e2e-%'
  `;
  console.log(`  tenants total: ${totalAfter[0].count} (esperado: ${realCount})`);
  console.log(`  tenants e2e-* restantes: ${e2eAfter[0].count} (esperado: 0)`);

  if (Number(e2eAfter[0].count) !== 0) {
    console.error('PROBLEMA: aún quedan tenants e2e tras el borrado!');
    await sql.end({ timeout: 1 });
    process.exit(1);
  }
  if (Number(totalAfter[0].count) !== realCount) {
    console.error(`PROBLEMA: conteo final (${totalAfter[0].count}) != esperado (${realCount})`);
    await sql.end({ timeout: 1 });
    process.exit(1);
  }

  await sql.end({ timeout: 1 });
  console.log('\nDONE — limpieza e2e completada sin errores.');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
