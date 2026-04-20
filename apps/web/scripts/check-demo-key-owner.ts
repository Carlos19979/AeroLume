import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, idle_timeout: 5 });
  const demoKey = process.env.NEXT_PUBLIC_DEMO_API_KEY!;
  const prefix = demoKey.slice(0, 11);
  console.log('Demo key prefix:', prefix);

  const owner = await sql<{ tenant_id: string; name: string; slug: string }[]>`
    SELECT ak.tenant_id, t.name, t.slug
    FROM api_keys ak JOIN tenants t ON t.id = ak.tenant_id
    WHERE ak.key_prefix = ${prefix}
  `;

  if (owner.length === 0) {
    console.log('No owner found — la key no existe en api_keys.');
  } else {
    console.log('Owner del demo key:');
    owner.forEach((o) => console.log(`  - tenant: ${o.name} (${o.slug}) id=${o.tenant_id}`));
  }

  // Look at the 19 quotes of carloscode tenant — patterns
  const carlosQuotes = await sql<{
    id: string;
    boat_model: string | null;
    customer_email: string | null;
    customer_name: string | null;
    created_at: Date;
  }[]>`
    SELECT q.id, q.boat_model, q.customer_email, q.customer_name, q.created_at
    FROM quotes q
    JOIN tenant_members tm ON tm.tenant_id = q.tenant_id
    JOIN auth.users u ON u.id = tm.user_id
    WHERE u.email = 'carloscode23@icloud.com'
    ORDER BY q.created_at ASC
    LIMIT 20
  `;
  console.log(`\nQuotes en tenant de carloscode23 (${carlosQuotes.length}):`);
  carlosQuotes.forEach((q) =>
    console.log(`  - ${q.created_at.toISOString().slice(0, 19)} | boat=${q.boat_model ?? '?'} | customer=${q.customer_email ?? '(empty)'}`),
  );

  await sql.end({ timeout: 1 });
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
