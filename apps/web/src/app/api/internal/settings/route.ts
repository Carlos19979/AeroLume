import { NextResponse } from 'next/server';
import { db, tenants, eq } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { isInternalUrl } from '@/lib/url-validation';
import { validateBody, updateTenantSettingsSchema } from '@/lib/validations';

export const GET = withTenantAuth(async (_request, { tenant }) => {
  const [data] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      companyName: tenants.companyName,
      phone: tenants.phone,
      website: tenants.website,
      country: tenants.country,
      city: tenants.city,
      customDomain: tenants.customDomain,
      locale: tenants.locale,
      currency: tenants.currency,
      allowedOrigins: tenants.allowedOrigins,
      webhookUrl: tenants.webhookUrl,
      plan: tenants.plan,
      subscriptionStatus: tenants.subscriptionStatus,
      trialEndsAt: tenants.trialEndsAt,
    })
    .from(tenants)
    .where(eq(tenants.id, tenant.id))
    .limit(1);

  return NextResponse.json({ data });
});

export const PUT = withTenantAuth(async (request, { tenant }) => {
  const body = await request.json();
  const validation = validateBody(updateTenantSettingsSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  if (data.webhookUrl) {
    try {
      new URL(data.webhookUrl);
      if (isInternalUrl(data.webhookUrl)) {
        return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
    }
  }

  const [updated] = await db
    .update(tenants)
    .set({
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      website: data.website,
      country: data.country,
      city: data.city,
      customDomain: data.customDomain,
      locale: data.locale,
      currency: data.currency,
      allowedOrigins: data.allowedOrigins,
      webhookUrl: data.webhookUrl,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id))
    .returning({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      companyName: tenants.companyName,
      phone: tenants.phone,
      website: tenants.website,
      country: tenants.country,
      city: tenants.city,
      customDomain: tenants.customDomain,
      locale: tenants.locale,
      currency: tenants.currency,
      allowedOrigins: tenants.allowedOrigins,
      webhookUrl: tenants.webhookUrl,
      plan: tenants.plan,
      subscriptionStatus: tenants.subscriptionStatus,
      trialEndsAt: tenants.trialEndsAt,
    });

  return NextResponse.json({ data: updated });
});
