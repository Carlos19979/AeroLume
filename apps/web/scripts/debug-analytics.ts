import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, idle_timeout: 5 });

  // Find Aerolume tenant
  const t = await sql<{ id: string }[]>`SELECT id FROM tenants WHERE slug = 'aerolume' LIMIT 1`;
  if (!t.length) {
    console.log('No tenant Aerolume');
    process.exit(0);
  }
  const tid = t[0].id;
  console.log('Tenant:', tid);

  // byType
  const byType = await sql<{ event_type: string; count: string }[]>`
    SELECT event_type, COUNT(*)::text AS count
    FROM analytics_events
    WHERE tenant_id = ${tid}::uuid
    GROUP BY event_type
    ORDER BY count DESC
  `;
  console.log('\nbyType:');
  byType.forEach((r) => console.log(`  ${r.event_type}: ${r.count}`));

  // topBoats with current filter (event_type = boat_search)
  const topBoats = await sql<{ boat_model: string; count: string }[]>`
    SELECT boat_model, COUNT(*)::text AS count
    FROM analytics_events
    WHERE tenant_id = ${tid}::uuid AND boat_model IS NOT NULL AND event_type = 'boat_search'
    GROUP BY boat_model
    ORDER BY count DESC
  `;
  console.log('\ntopBoats (event_type = boat_search):');
  topBoats.forEach((r) => console.log(`  ${r.boat_model}: ${r.count}`));

  // Sanity: sum of topBoats vs byType[boat_search]
  const sumTop = topBoats.reduce((s, r) => s + parseInt(r.count, 10), 0);
  const cardBoatSearch = byType.find((b) => b.event_type === 'boat_search');
  console.log(`\nSUM(topBoats counts) = ${sumTop}`);
  console.log(`byType[boat_search]  = ${cardBoatSearch?.count ?? '0'}`);
  console.log(`Should match? ${sumTop === parseInt(cardBoatSearch?.count ?? '0', 10) ? 'YES' : 'NO'}`);

  // Check if there are boat_search events with NULL boat_model
  const nullBoats = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM analytics_events
    WHERE tenant_id = ${tid}::uuid AND event_type = 'boat_search' AND boat_model IS NULL
  `;
  console.log(`boat_search events with NULL boat_model: ${nullBoats[0].count}`);

  await sql.end({ timeout: 1 });
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
