/**
 * E2E tests for the LemonSqueezy webhook handler.
 *
 * Route: POST /api/webhooks/lemonsqueezy
 * Signing: HMAC-SHA256 over raw body, signature in `X-Signature` header (hex).
 * Secret env var: LEMONSQUEEZY_WEBHOOK_SECRET (read at server startup via Next.js)
 *
 * DB fields exercised: tenants.plan, tenants.ls_subscription_id,
 *   tenants.ls_customer_id, tenants.subscription_status.
 *
 * NOTE: If the dev server was started before LEMONSQUEEZY_WEBHOOK_SECRET was set in
 * .env.local, the server process won't have the secret and verifyWebhookSignature
 * will throw → 500. Tests detect this via a probe in beforeAll and skip gracefully.
 */

import crypto from 'node:crypto';
import { test, expect } from '../fixtures/auth';
import { dbQuery } from '../fixtures/api';
import { createTestTenant, cleanupTenant } from '../fixtures/tenant';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sign(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/** Secret as seen by the TEST process (loaded from .env.local by playwright config). */
function getSecret(): string {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '';
}

function getBaseURL(baseURL: string | undefined): string {
  return (baseURL ?? 'http://localhost:3000').replace(/\/+$/, '');
}

async function postWebhook(
  baseURL: string,
  body: string,
  signature: string,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${baseURL}/api/webhooks/lemonsqueezy`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': signature,
    },
    body,
  });
  const ct = res.headers.get('content-type') ?? '';
  const parsed = ct.includes('application/json') ? await res.json() : await res.text();
  return { status: res.status, body: parsed };
}

/** Build a minimal LS subscription payload. */
function buildPayload(
  eventName: string,
  tenantId: string,
  opts: {
    subscriptionId?: string;
    customerId?: string;
    status?: string;
  } = {},
): string {
  return JSON.stringify({
    meta: {
      event_name: eventName,
      custom_data: { tenant_id: tenantId },
    },
    data: {
      id: opts.subscriptionId ?? 'ls-sub-e2e-001',
      attributes: {
        customer_id: opts.customerId ?? 'ls-cust-e2e-001',
        status: opts.status ?? 'active',
      },
    },
  });
}

/** Read back the relevant subscription fields for a tenant. */
async function fetchTenantSub(tenantId: string) {
  const rows = await dbQuery<{
    plan: string;
    subscription_status: string;
    ls_subscription_id: string | null;
    ls_customer_id: string | null;
  }>(
    `SELECT plan, subscription_status, ls_subscription_id, ls_customer_id
     FROM tenants WHERE id = $1::uuid`,
    [tenantId],
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// Supabase admin helpers (lightweight user lifecycle for webhook tests that
// don't need the full auth fixture with catalog clone).
// ---------------------------------------------------------------------------

function getServiceClient() {
  const url = process.env.E2E_SUPABASE_URL;
  const key = process.env.E2E_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('E2E Supabase env vars not set');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function makeUser(workerIdx: number): Promise<string> {
  const supabase = getServiceClient();
  const email = `e2e-wh-${workerIdx}-${Date.now()}@aerolume.test`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: true,
  });
  if (error || !data?.user) throw new Error(`createUser failed: ${error?.message}`);
  return data.user.id;
}

async function deleteUser(userId: string) {
  const supabase = getServiceClient();
  await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
}

/**
 * Probe whether the running dev server has LEMONSQUEEZY_WEBHOOK_SECRET configured.
 * If the server throws (returns 500) we know it doesn't — skip all tests.
 * We probe with a valid signature but a non-existent tenant_id to avoid any DB side-effects.
 */
async function serverHasSecret(baseURL: string, secret: string): Promise<boolean> {
  const body = buildPayload('subscription_created', '00000000-0000-0000-0000-000000000001');
  const sig = sign(body, secret);
  try {
    const res = await fetch(`${baseURL}/api/webhooks/lemonsqueezy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-signature': sig },
      body,
    });
    // 200 = secret matched; 401 = secret wrong; 400/500 = secret missing or other error
    return res.status === 200 || res.status === 400;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 1. Signature verification
// ---------------------------------------------------------------------------

test.describe('LemonSqueezy webhook — signature verification', () => {
  let skipReason = '';

  test.beforeAll(async ({ baseURL }) => {
    const secret = getSecret();
    if (!secret) {
      skipReason = 'LEMONSQUEEZY_WEBHOOK_SECRET not set in .env.local';
      return;
    }
    const base = getBaseURL(baseURL);
    const ok = await serverHasSecret(base, secret);
    if (!ok) {
      skipReason =
        'Dev server does not have LEMONSQUEEZY_WEBHOOK_SECRET — restart the dev server after setting it in .env.local';
    }
  });

  test('missing X-Signature header → 401', async ({ baseURL }) => {
    test.skip(!!skipReason, skipReason);

    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_created', '00000000-0000-0000-0000-000000000000');

    const res = await fetch(`${base}/api/webhooks/lemonsqueezy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    expect(res.status).toBe(401);
  });

  test('wrong signature (signed with different secret) → 401', async ({ baseURL }) => {
    test.skip(!!skipReason, skipReason);

    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_created', '00000000-0000-0000-0000-000000000000');
    const badSig = sign(body, 'totally-wrong-secret');

    const { status } = await postWebhook(base, body, badSig);
    expect(status).toBe(401);
  });

  test('tampered body (signature was for a different payload) → 401', async ({ baseURL }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const originalBody = buildPayload('subscription_created', '00000000-0000-0000-0000-000000000000');
    const tamperedBody = buildPayload('subscription_cancelled', '00000000-0000-0000-0000-000000000000');
    const sigForOriginal = sign(originalBody, secret);

    const { status } = await postWebhook(base, tamperedBody, sigForOriginal);
    expect(status).toBe(401);
  });

  test('valid signature with non-existent tenant → 200 (DB update matches 0 rows, no error)', async ({
    baseURL,
  }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_created', '00000000-0000-0000-0000-000000000000');
    const sig = sign(body, secret);

    const { status } = await postWebhook(base, body, sig);
    expect(status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 2. subscription_created → tenant upgrade
// ---------------------------------------------------------------------------

test.describe('LemonSqueezy webhook — subscription_created', () => {
  let skipReason = '';
  let userId = '';
  let tenantId = '';

  test.beforeAll(async ({ baseURL }, testInfo) => {
    const secret = getSecret();
    if (!secret) {
      skipReason = 'LEMONSQUEEZY_WEBHOOK_SECRET not set in .env.local';
      return;
    }
    const base = getBaseURL(baseURL);
    const ok = await serverHasSecret(base, secret);
    if (!ok) {
      skipReason =
        'Dev server does not have LEMONSQUEEZY_WEBHOOK_SECRET — restart the dev server after setting it in .env.local';
      return;
    }
    userId = await makeUser(testInfo.workerIndex);
    const created = await createTestTenant({ ownerUserId: userId, plan: 'prueba' });
    tenantId = created.tenantId;
  });

  test.afterAll(async () => {
    if (tenantId) await cleanupTenant(tenantId).catch(() => undefined);
    if (userId) await deleteUser(userId);
  });

  test('upgrades plan to pro and populates subscription fields', async ({ baseURL }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_created', tenantId, {
      subscriptionId: 'ls-sub-created-001',
      customerId: 'ls-cust-created-001',
      status: 'active',
    });
    const sig = sign(body, secret);

    const { status } = await postWebhook(base, body, sig);
    expect(status).toBe(200);

    const row = await fetchTenantSub(tenantId);
    expect(row.plan).toBe('pro');
    expect(row.subscription_status).toBe('active');
    expect(row.ls_subscription_id).toBe('ls-sub-created-001');
    expect(row.ls_customer_id).toBe('ls-cust-created-001');
  });
});

// ---------------------------------------------------------------------------
// 3. subscription_updated → status change to past_due
// ---------------------------------------------------------------------------

test.describe('LemonSqueezy webhook — subscription_updated', () => {
  let skipReason = '';
  let userId = '';
  let tenantId = '';

  test.beforeAll(async ({ baseURL }, testInfo) => {
    const secret = getSecret();
    if (!secret) {
      skipReason = 'LEMONSQUEEZY_WEBHOOK_SECRET not set in .env.local';
      return;
    }
    const base = getBaseURL(baseURL);
    const ok = await serverHasSecret(base, secret);
    if (!ok) {
      skipReason =
        'Dev server does not have LEMONSQUEEZY_WEBHOOK_SECRET — restart the dev server after setting it in .env.local';
      return;
    }
    userId = await makeUser(testInfo.workerIndex);
    const created = await createTestTenant({ ownerUserId: userId, plan: 'pro' });
    tenantId = created.tenantId;
    // Seed an active subscription so the row is consistent.
    await dbQuery(
      `UPDATE tenants
       SET ls_subscription_id = 'ls-sub-upd-001', ls_customer_id = 'ls-cust-upd-001',
           subscription_status = 'active'
       WHERE id = $1::uuid`,
      [tenantId],
    );
  });

  test.afterAll(async () => {
    if (tenantId) await cleanupTenant(tenantId).catch(() => undefined);
    if (userId) await deleteUser(userId);
  });

  test('sets subscription_status to past_due', async ({ baseURL }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_updated', tenantId, {
      subscriptionId: 'ls-sub-upd-001',
      customerId: 'ls-cust-upd-001',
      status: 'past_due',
    });
    const sig = sign(body, secret);

    const { status } = await postWebhook(base, body, sig);
    expect(status).toBe(200);

    const row = await fetchTenantSub(tenantId);
    expect(row.subscription_status).toBe('past_due');
    // Plan should stay pro (subscription_updated with past_due does not downgrade)
    expect(row.plan).toBe('pro');
  });
});

// ---------------------------------------------------------------------------
// 4. subscription_cancelled → status becomes canceled; plan stays pro
//    (handler only sets subscriptionStatus — no immediate downgrade to prueba)
// ---------------------------------------------------------------------------

test.describe('LemonSqueezy webhook — subscription_cancelled', () => {
  let skipReason = '';
  let userId = '';
  let tenantId = '';

  test.beforeAll(async ({ baseURL }, testInfo) => {
    const secret = getSecret();
    if (!secret) {
      skipReason = 'LEMONSQUEEZY_WEBHOOK_SECRET not set in .env.local';
      return;
    }
    const base = getBaseURL(baseURL);
    const ok = await serverHasSecret(base, secret);
    if (!ok) {
      skipReason =
        'Dev server does not have LEMONSQUEEZY_WEBHOOK_SECRET — restart the dev server after setting it in .env.local';
      return;
    }
    userId = await makeUser(testInfo.workerIndex);
    const created = await createTestTenant({ ownerUserId: userId, plan: 'pro' });
    tenantId = created.tenantId;
    await dbQuery(
      `UPDATE tenants
       SET ls_subscription_id = 'ls-sub-cancel-001', ls_customer_id = 'ls-cust-cancel-001',
           subscription_status = 'active'
       WHERE id = $1::uuid`,
      [tenantId],
    );
  });

  test.afterAll(async () => {
    if (tenantId) await cleanupTenant(tenantId).catch(() => undefined);
    if (userId) await deleteUser(userId);
  });

  test('sets subscription_status to canceled; plan stays pro (no immediate downgrade)', async ({
    baseURL,
  }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_cancelled', tenantId, {
      subscriptionId: 'ls-sub-cancel-001',
      customerId: 'ls-cust-cancel-001',
    });
    const sig = sign(body, secret);

    const { status } = await postWebhook(base, body, sig);
    expect(status).toBe(200);

    const row = await fetchTenantSub(tenantId);
    expect(row.subscription_status).toBe('canceled');
    expect(row.plan).toBe('pro');
  });
});

// ---------------------------------------------------------------------------
// 5. Idempotency — sending subscription_created twice
// ---------------------------------------------------------------------------

test.describe('LemonSqueezy webhook — idempotency', () => {
  let skipReason = '';
  let userId = '';
  let tenantId = '';

  test.beforeAll(async ({ baseURL }, testInfo) => {
    const secret = getSecret();
    if (!secret) {
      skipReason = 'LEMONSQUEEZY_WEBHOOK_SECRET not set in .env.local';
      return;
    }
    const base = getBaseURL(baseURL);
    const ok = await serverHasSecret(base, secret);
    if (!ok) {
      skipReason =
        'Dev server does not have LEMONSQUEEZY_WEBHOOK_SECRET — restart the dev server after setting it in .env.local';
      return;
    }
    userId = await makeUser(testInfo.workerIndex);
    const created = await createTestTenant({ ownerUserId: userId, plan: 'prueba' });
    tenantId = created.tenantId;
  });

  test.afterAll(async () => {
    if (tenantId) await cleanupTenant(tenantId).catch(() => undefined);
    if (userId) await deleteUser(userId);
  });

  test('second identical subscription_created returns 200 and DB is stable', async ({
    baseURL,
  }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const body = buildPayload('subscription_created', tenantId, {
      subscriptionId: 'ls-sub-idem-001',
      customerId: 'ls-cust-idem-001',
      status: 'active',
    });
    const sig = sign(body, secret);

    // First call
    const first = await postWebhook(base, body, sig);
    expect(first.status).toBe(200);

    // Second call — identical payload, same signature
    const second = await postWebhook(base, body, sig);
    expect(second.status).toBe(200);

    const row = await fetchTenantSub(tenantId);
    expect(row.plan).toBe('pro');
    expect(row.subscription_status).toBe('active');
    expect(row.ls_subscription_id).toBe('ls-sub-idem-001');
  });
});

// ---------------------------------------------------------------------------
// 6. Unknown event_name → 200 (falls through switch, no DB change)
// ---------------------------------------------------------------------------

test.describe('LemonSqueezy webhook — unknown event', () => {
  let skipReason = '';
  let userId = '';
  let tenantId = '';

  test.beforeAll(async ({ baseURL }, testInfo) => {
    const secret = getSecret();
    if (!secret) {
      skipReason = 'LEMONSQUEEZY_WEBHOOK_SECRET not set in .env.local';
      return;
    }
    const base = getBaseURL(baseURL);
    const ok = await serverHasSecret(base, secret);
    if (!ok) {
      skipReason =
        'Dev server does not have LEMONSQUEEZY_WEBHOOK_SECRET — restart the dev server after setting it in .env.local';
      return;
    }
    userId = await makeUser(testInfo.workerIndex);
    const created = await createTestTenant({ ownerUserId: userId, plan: 'prueba' });
    tenantId = created.tenantId;
  });

  test.afterAll(async () => {
    if (tenantId) await cleanupTenant(tenantId).catch(() => undefined);
    if (userId) await deleteUser(userId);
  });

  test('unknown event_name returns 200 without modifying tenant DB row', async ({ baseURL }) => {
    test.skip(!!skipReason, skipReason);

    const secret = getSecret();
    const base = getBaseURL(baseURL);
    const body = buildPayload('wat_lol', tenantId);
    const sig = sign(body, secret);

    const before = await fetchTenantSub(tenantId);
    const { status } = await postWebhook(base, body, sig);
    expect(status).toBe(200);

    const after = await fetchTenantSub(tenantId);
    expect(after.plan).toBe(before.plan);
    expect(after.subscription_status).toBe(before.subscription_status);
    expect(after.ls_subscription_id).toBe(before.ls_subscription_id);
  });
});
