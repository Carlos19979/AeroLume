import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, tenants, eq } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

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
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const body = await request.json();

  const [updated] = await db
    .update(tenants)
    .set({
      name: body.name,
      companyName: body.companyName,
      phone: body.phone,
      website: body.website,
      country: body.country,
      city: body.city,
      customDomain: body.customDomain,
      locale: body.locale,
      currency: body.currency,
      allowedOrigins: body.allowedOrigins,
      webhookUrl: body.webhookUrl,
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
}
