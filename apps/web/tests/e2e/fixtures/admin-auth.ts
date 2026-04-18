/**
 * Admin auth helper for E2E tests.
 *
 * Provisions a Supabase user whose email matches the SUPER_ADMIN_EMAILS value
 * configured in .env.local (admin@example.com) and logs them in via the UI.
 * Because super-admin is determined purely by email, we use the service-role
 * API to create/delete the user while keeping the password predictable.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@example.com';
export const ADMIN_PASSWORD = 'AdminPassword123!';

function getServiceClient(): SupabaseClient {
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_KEY not set');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Find the admin user in Supabase. globalSetup.ts ensures the admin user
 * exists with ADMIN_PASSWORD before any worker starts, so this is a simple
 * lookup — no writes, no session invalidation.
 */
export async function ensureAdminUser(): Promise<{ userId: string; created: boolean }> {
  const supabase = getServiceClient();

  // Paginate through users to find by email.
  let page = 1;
  while (true) {
    const { data: listData, error } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
    if (error || !listData?.users?.length) break;
    const found = listData.users.find((u) => u.email === ADMIN_EMAIL);
    if (found) return { userId: found.id, created: false };
    if (listData.users.length < 50) break;
    page++;
  }

  throw new Error(
    `Admin user ${ADMIN_EMAIL} not found in Supabase. ` +
    `Ensure globalSetup.ts ran and provisionAdminUser succeeded.`,
  );
}


/**
 * Delete the admin Supabase user. Only call this when you know the user was
 * created solely for the test (i.e. ensureAdminUser returned created:true).
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const supabase = getServiceClient();
  await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
}

/**
 * Log in as the super-admin via the login page and wait for redirect.
 * After this call, `page` has a valid Supabase session for ADMIN_EMAIL.
 */
export async function adminLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/i }).click();
  // Admin is redirected to /admin after login (or /dashboard — both are fine)
  await page.waitForURL(/\/(admin|dashboard)(\/.*)?$/, { timeout: 20_000 });
}

/**
 * Log in as an arbitrary user (non-admin tenant user) via the login page.
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: /Iniciar sesion|Entrando/i }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 20_000 });
}
