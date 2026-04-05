import { NextResponse } from 'next/server';
import { db, tenants, eq } from '@aerolume/db';
import { withTenantAuth } from '@/lib/auth-helpers';
import { validateBody, updateThemeSchema } from '@/lib/validations';

export const GET = withTenantAuth(async (_request, { tenant }) => {
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
});

export const PUT = withTenantAuth(async (request, { tenant }) => {
  const body = await request.json();
  const validation = validateBody(updateThemeSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const data = validation.data;

  const [updated] = await db
    .update(tenants)
    .set({
      themeAccent: data.themeAccent,
      themeAccentDim: data.themeAccentDim,
      themeNavy: data.themeNavy,
      themeText: data.themeText,
      themeFontDisplay: data.themeFontDisplay,
      themeFontBody: data.themeFontBody,
      themeColorMain: data.themeColorMain,
      themeColorHead: data.themeColorHead,
      themeColorSpi: data.themeColorSpi,
      logoUrl: data.logoUrl,
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
});
