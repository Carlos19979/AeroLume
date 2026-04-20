import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, tenants, eq } from '@aerolume/db';
import { SettingsClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function SettingsPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

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
      cancelationGraceEndsAt: tenants.cancelationGraceEndsAt,
      lsCustomerId: tenants.lsCustomerId,
    })
    .from(tenants)
    .where(eq(tenants.id, auth.tenant.id))
    .limit(1);

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Ajustes de tu workspace y configuración técnica." />
      <SettingsClient
        initialSettings={settings}
        subscription={{
          plan: settings?.plan ?? 'prueba',
          status: settings?.subscriptionStatus ?? 'trialing',
          trialEndsAt: settings?.trialEndsAt?.toISOString() ?? null,
          cancelationGraceEndsAt: settings?.cancelationGraceEndsAt?.toISOString() ?? null,
          lsCustomerId: settings?.lsCustomerId ?? null,
        }}
      />
    </div>
  );
}
