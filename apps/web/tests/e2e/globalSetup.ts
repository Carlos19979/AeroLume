import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

/**
 * Global setup for Playwright E2E tests.
 * - Validates that required env vars exist.
 * - Performs a lightweight DB sanity check to confirm the dev tenant is seeded.
 */
export default async function globalSetup(): Promise<void> {
  dotenvConfig({ path: path.resolve(__dirname, '../../.env.local') });

  const requiredVars = [
    'E2E_SUPABASE_URL',
    'E2E_SUPABASE_SERVICE_KEY',
    'E2E_DATABASE_URL',
    'NEXT_PUBLIC_DEMO_API_KEY',
  ] as const;

  const missing: string[] = [];
  for (const name of requiredVars) {
    if (!process.env[name] || process.env[name]!.trim() === '') {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[e2e:globalSetup] Missing required env vars: ${missing.join(', ')}.\n` +
        `Define them in apps/web/.env.local. They can simply mirror the existing ` +
        `NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL values.`,
    );
  }

  // Lightweight DB check: ensure at least one tenant exists (dev tenant should be seeded).
  const sql = postgres(process.env.E2E_DATABASE_URL!, { max: 1, idle_timeout: 2 });
  try {
    const rows = await sql<{ count: string }[]>`SELECT COUNT(*)::text as count FROM tenants`;
    const count = parseInt(rows[0]?.count ?? '0', 10);
    if (!Number.isFinite(count) || count === 0) {
      throw new Error(
        `[e2e:globalSetup] No tenants found in DB. Run 'pnpm db:seed' before running E2E tests.`,
      );
    }
     
    console.log(`[e2e:globalSetup] OK — ${count} tenant(s) present in DB.`);
  } finally {
    await sql.end({ timeout: 2 });
  }

  // Provision the super-admin user once before any worker starts.
  // This avoids race conditions when multiple workers call ensureAdminUser concurrently
  // (concurrent updateUserById calls invalidate each other's sessions).
  await provisionAdminUser();
}

/**
 * Ensure admin@example.com exists in Supabase with the known E2E test password.
 * Called once in globalSetup before any worker starts.
 */
async function provisionAdminUser(): Promise<void> {
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'AdminPassword123!';

  const url = process.env.E2E_SUPABASE_URL!;
  const serviceKey = process.env.E2E_SUPABASE_SERVICE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const serviceClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Try sign-in first — if it succeeds, no changes needed.
  if (anonKey) {
    const anonClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signIn } = await anonClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (signIn?.user) {
       
      console.log('[e2e:globalSetup] Admin user already exists with correct password.');
      return;
    }
  }

  // Try creating the user (idempotent — fails gracefully if exists).
  const { data: created } = await serviceClient.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (created?.user) {
     
    console.log('[e2e:globalSetup] Admin user created.');
    return;
  }

  // User exists but has a different password — find and update once.
  let page = 1;
  while (true) {
    const { data: listData } = await serviceClient.auth.admin.listUsers({ page, perPage: 50 });
    if (!listData?.users?.length) break;
    const found = listData.users.find((u: { email?: string }) => u.email === ADMIN_EMAIL);
    if (found) {
      await serviceClient.auth.admin.updateUserById(found.id, { password: ADMIN_PASSWORD });
       
      console.log('[e2e:globalSetup] Admin user password reset.');
      return;
    }
    if (listData.users.length < 50) break;
    page++;
  }

   
  console.warn('[e2e:globalSetup] Could not provision admin user — admin tests may fail.');
}
