import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { isSuperAdmin } from '@/lib/admin';

type TenantContext = {
  user: { id: string; email: string };
  // Tenant shape is the full DB row — keep permissive here to avoid narrowing boilerplate
  // in every handler. The actual columns live in packages/db/src/schema/tenants.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenant: { id: string; [key: string]: any };
};

type AdminContext = {
  user: { id: string; email: string };
};

// Route params shape varies per route; handlers know their own expected keys,
// so we keep the wrapper signature permissive and let callers destructure safely.
/* eslint-disable @typescript-eslint/no-explicit-any */
type TenantHandler = (req: NextRequest, ctx: TenantContext, params: any) => Promise<NextResponse>;
type AdminHandler = (req: NextRequest, ctx: AdminContext, params: any) => Promise<NextResponse>;
/* eslint-enable @typescript-eslint/no-explicit-any */

function isAccessExpired(tenant: {
  plan: string | null;
  trialEndsAt: Date | null;
  subscriptionStatus?: string | null;
  cancelationGraceEndsAt?: Date | null;
}): boolean {
  // Trial expired
  if (tenant.plan === 'prueba' && (!tenant.trialEndsAt || new Date(tenant.trialEndsAt) <= new Date())) {
    return true;
  }
  // Cancellation grace period has elapsed
  if (
    tenant.subscriptionStatus === 'canceled' &&
    tenant.cancelationGraceEndsAt &&
    new Date(tenant.cancelationGraceEndsAt) <= new Date()
  ) {
    return true;
  }
  return false;
}

export function withTenantAuth(handler: TenantHandler) {
  return async (req: NextRequest, routeCtx?: { params?: Promise<Record<string, string>> }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const tenant = await getTenantForUser(user.id, user.email);
      if (!tenant) {
        return NextResponse.json({ error: 'No tenant found' }, { status: 403 });
      }

      // Block mutations when trial or grace period has expired (GET is always allowed)
      const method = req.method.toUpperCase();
      if (method !== 'GET' && isAccessExpired(tenant)) {
        return NextResponse.json({ error: 'Trial expired' }, { status: 403 });
      }

      const params = routeCtx?.params ? await routeCtx.params : {};
      return await handler(req, { user: { id: user.id, email: user.email! }, tenant }, params);
    } catch (error) {
      console.error('Request failed:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function withAdminAuth(handler: AdminHandler) {
  return async (req: NextRequest, routeCtx?: { params?: Promise<Record<string, string>> }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isSuperAdmin(user.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // MFA gate — only enforced when ENFORCE_SUPER_ADMIN_MFA=1
      if (process.env.ENFORCE_SUPER_ADMIN_MFA === '1') {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData) {
          const { currentLevel, nextLevel } = aalData;
          if (currentLevel === 'aal1' && nextLevel === 'aal1') {
            // No factor enrolled — must enroll
            return NextResponse.json(
              { error: 'MFA required', code: 'mfa_enroll' },
              { status: 403 },
            );
          }
          if (currentLevel === 'aal1' && nextLevel === 'aal2') {
            // Factor enrolled but not yet challenged this session
            return NextResponse.json(
              { error: 'MFA required', code: 'mfa_challenge' },
              { status: 403 },
            );
          }
          // currentLevel === 'aal2' → OK
        }
      }

      const params = routeCtx?.params ? await routeCtx.params : {};
      return await handler(req, { user: { id: user.id, email: user.email! } }, params);
    } catch (error) {
      console.error('Request failed:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
