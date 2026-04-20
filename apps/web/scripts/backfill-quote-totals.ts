/**
 * backfill-quote-totals.ts
 *
 * One-shot script to backfill total_price on quotes where it is NULL
 * but quote_items with unit_price exist.
 *
 * Usage:
 *   pnpm tsx apps/web/scripts/backfill-quote-totals.ts
 *
 * Optional: restrict to a single tenant:
 *   TENANT_ID=<uuid> pnpm tsx apps/web/scripts/backfill-quote-totals.ts
 *
 * Run from the repo root. Requires DATABASE_URL in apps/web/.env.local.
 */
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('FATAL: DATABASE_URL not set in apps/web/.env.local');
    process.exit(1);
  }

  const tenantId = process.env.TENANT_ID ?? null;
  const sql = postgres(dbUrl, { max: 1, idle_timeout: 5 });

  console.log('DB host:', dbUrl.split('@')[1]?.split('/')[0] ?? '(hidden)');
  if (tenantId) {
    console.log(`Restricting to tenant: ${tenantId}`);
  } else {
    console.log('Processing ALL tenants (set TENANT_ID env var to restrict)');
  }

  // Count candidates before
  const [{ count: candidateCount }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM quotes q
    WHERE q.total_price IS NULL
      ${tenantId ? sql`AND q.tenant_id = ${tenantId}::uuid` : sql``}
      AND EXISTS (
        SELECT 1 FROM quote_items qi
        WHERE qi.quote_id = q.id AND qi.unit_price IS NOT NULL
      )
  `;
  console.log(`\nQuotes eligible for backfill: ${candidateCount}`);

  if (Number(candidateCount) === 0) {
    console.log('Nothing to do. Exiting.');
    await sql.end({ timeout: 1 });
    return;
  }

  // Perform the backfill
  const updated = await sql<{ id: string }[]>`
    UPDATE quotes
    SET total_price = (
      SELECT SUM(qi.unit_price * qi.quantity)
      FROM quote_items qi
      WHERE qi.quote_id = quotes.id
    )
    WHERE total_price IS NULL
      ${tenantId ? sql`AND tenant_id = ${tenantId}::uuid` : sql``}
      AND EXISTS (
        SELECT 1 FROM quote_items qi
        WHERE qi.quote_id = quotes.id AND qi.unit_price IS NOT NULL
      )
    RETURNING id
  `;

  console.log(`\nBackfilled ${updated.length} quote(s).`);

  await sql.end({ timeout: 1 });
  console.log('\nDONE.');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
