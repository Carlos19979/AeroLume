import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, tenants, eq } from '@aerolume/db';
import { ThemeClient } from './client';

export default async function ThemePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id);
  if (!tenant) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tienes un workspace configurado.
      </div>
    );
  }

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
      logoUrl: tenants.logoUrl,
    })
    .from(tenants)
    .where(eq(tenants.id, tenant.id))
    .limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Personalizar</h2>
        <p className="text-gray-500 mt-1">
          Personaliza los colores y fuentes del configurador embebido.
        </p>
      </div>
      <ThemeClient initialTheme={theme} />
    </div>
  );
}
