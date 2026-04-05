import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, tenants, eq } from '@aerolume/db';
import { SettingsClient } from './client';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id, user.email);
  if (!tenant) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tienes un workspace configurado.
      </div>
    );
  }

  const [settings] = await db
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Configuración</h2>
        <p className="text-gray-500 mt-1">
          Ajustes de tu workspace y configuración técnica.
        </p>
      </div>
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
