import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { isSuperAdmin } from '@/lib/admin';

type TenantContext = {
  user: { id: string; email: string };
  tenant: { id: string; [key: string]: any };
};

type AdminContext = {
  user: { id: string; email: string };
};

type TenantHandler = (req: NextRequest, ctx: TenantContext, params?: any) => Promise<NextResponse>;
type AdminHandler = (req: NextRequest, ctx: AdminContext, params?: any) => Promise<NextResponse>;

export function withTenantAuth(handler: TenantHandler) {
  return async (req: NextRequest, routeCtx?: { params?: Promise<any> }) => {
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

      const params = routeCtx?.params ? await routeCtx.params : undefined;
      return await handler(req, { user: { id: user.id, email: user.email! }, tenant }, params);
    } catch (error) {
      console.error('Request failed:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function withAdminAuth(handler: AdminHandler) {
  return async (req: NextRequest, routeCtx?: { params?: Promise<any> }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isSuperAdmin(user.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const params = routeCtx?.params ? await routeCtx.params : undefined;
      return await handler(req, { user: { id: user.id, email: user.email! } }, params);
    } catch (error) {
      console.error('Request failed:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
