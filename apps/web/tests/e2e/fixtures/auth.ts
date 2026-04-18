import { test as base } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  createTestTenant,
  cleanupTenant,
  closeTenantDb,
} from './tenant';

export interface TestTenant {
  tenantId: string;
  userId: string;
  email: string;
  password: string;
  apiKey: string;
}

interface Fixtures {
  tenant: TestTenant;
}

const TEST_PASSWORD = 'TestPassword123!';

function getServiceClient(): SupabaseClient {
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_KEY not set');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Extends Playwright's `test` with a `tenant` fixture that provisions a fresh
 * Supabase user + tenant (with owner membership, cloned catalog, and API key)
 * per worker-test use, and tears everything down afterwards.
 */
export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  tenant: async ({}, use, testInfo) => {
    const supabase = getServiceClient();
    const email = `e2e-${testInfo.workerIndex}-${Date.now()}@aerolume.test`;

    const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (userErr || !userData?.user) {
      throw new Error(`Failed to create test user: ${userErr?.message ?? 'unknown'}`);
    }
    const userId = userData.user.id;

    let tenantId: string | null = null;
    let apiKey = '';
    try {
      const created = await createTestTenant({
        ownerUserId: userId,
        withApiKey: true,
      });
      tenantId = created.tenantId;
      apiKey = created.apiKey ?? '';

      const fixture: TestTenant = {
        tenantId,
        userId,
        email,
        password: TEST_PASSWORD,
        apiKey,
      };

      await use(fixture);
    } finally {
      // Teardown — cascade removes tenant-owned rows; then remove the auth user.
      if (tenantId) {
        await cleanupTenant(tenantId).catch((e: unknown) =>
          console.warn(`[auth fixture] cleanupTenant failed: ${(e as Error).message}`),
        );
      }
      await supabase.auth.admin.deleteUser(userId).catch((e: unknown) =>
        console.warn(`[auth fixture] deleteUser failed: ${(e as Error).message}`),
      );
    }
  },
});

export const expect = test.expect;

// Re-export a helper so specs can close the shared DB pool at the very end if needed.
export { closeTenantDb };
