import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth-helpers';
import { createCustomerPortalUrl } from '@/lib/lemonsqueezy';

export const POST = withTenantAuth(async (_req: NextRequest, { tenant }) => {
  if (!tenant.lsCustomerId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
  }

  try {
    const url = await createCustomerPortalUrl(tenant.lsCustomerId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Customer portal error:', error);
    return NextResponse.json({ error: 'Failed to create customer portal URL' }, { status: 500 });
  }
});
