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
      themeAccent: tenants.themeAccent,
      themeAccentDim: tenants.themeAccentDim,
      themeNavy: tenants.themeNavy,
      themeText: tenants.themeText,
      themeFontDisplay: tenants.themeFontDisplay,
      themeFontBody: tenants.themeFontBody,
      themeColorMain: tenants.themeColorMain,
      themeColorHead: tenants.themeColorHead,
      themeColorSpi: tenants.themeColorSpi,
      logoUrl: tenants.logoUrl,
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
      themeAccent: body.themeAccent,
      themeAccentDim: body.themeAccentDim,
      themeNavy: body.themeNavy,
      themeText: body.themeText,
      themeFontDisplay: body.themeFontDisplay,
      themeFontBody: body.themeFontBody,
      themeColorMain: body.themeColorMain,
      themeColorHead: body.themeColorHead,
      themeColorSpi: body.themeColorSpi,
      logoUrl: body.logoUrl,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id))
    .returning({
      themeAccent: tenants.themeAccent,
      themeAccentDim: tenants.themeAccentDim,
      themeNavy: tenants.themeNavy,
      themeText: tenants.themeText,
      themeFontDisplay: tenants.themeFontDisplay,
      themeFontBody: tenants.themeFontBody,
      themeColorMain: tenants.themeColorMain,
      themeColorHead: tenants.themeColorHead,
      themeColorSpi: tenants.themeColorSpi,
      logoUrl: tenants.logoUrl,
    });

  return NextResponse.json({ data: updated });
}
