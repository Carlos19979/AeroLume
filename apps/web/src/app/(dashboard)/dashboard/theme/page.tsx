import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, tenants, eq } from '@aerolume/db';
import { ThemeClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function ThemePage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

  const [theme] = await db
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
      themeCtaLabel: tenants.themeCtaLabel,
      themeContactTitle: tenants.themeContactTitle,
      themeContactSubtitle: tenants.themeContactSubtitle,
      logoUrl: tenants.logoUrl,
    })
    .from(tenants)
    .where(eq(tenants.id, auth.tenant.id))
    .limit(1);

  return (
    <div className="space-y-6">
      <PageHeader title="Personalizar" description="Personaliza los colores y fuentes del configurador embebido." />
      <ThemeClient initialTheme={theme} />
    </div>
  );
}
