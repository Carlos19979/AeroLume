import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth-helpers';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';

export const POST = withTenantAuth(async (req: NextRequest, { user, tenant }) => {
  try {
    const checkoutUrl = await createCheckoutUrl(tenant.id, user.email);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
});
