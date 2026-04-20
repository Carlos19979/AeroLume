import { db, apiKeys, tenants, eq } from '@aerolume/db';
import { hashApiKey } from '@/lib/api-keys';
import { EmbedConfigurator } from './configurator';

type Props = { searchParams: Promise<{ key?: string }> };

export default async function EmbedPage({ searchParams }: Props) {
  const { key } = await searchParams;

  if (!key || !key.startsWith('ak_')) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        API key inválida o no proporcionada.
      </div>
    );
  }

  const keyHash = hashApiKey(key);

  const [found] = await db
    .select({
      tenantId: apiKeys.tenantId,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!found) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        API key no reconocida.
      </div>
    );
  }

  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
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
      locale: tenants.locale,
      currency: tenants.currency,
      plan: tenants.plan,
      subscriptionStatus: tenants.subscriptionStatus,
      trialEndsAt: tenants.trialEndsAt,
      cancelationGraceEndsAt: tenants.cancelationGraceEndsAt,
    })
    .from(tenants)
    .where(eq(tenants.id, found.tenantId))
    .limit(1);

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Tenant no encontrado.
      </div>
    );
  }

  const isPro = tenant.plan === 'pro' && tenant.subscriptionStatus === 'active';
  const isActiveTrial =
    tenant.plan === 'prueba' && tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date();
  const isCanceledInGrace =
    tenant.subscriptionStatus === 'canceled' &&
    tenant.cancelationGraceEndsAt &&
    new Date(tenant.cancelationGraceEndsAt) > new Date();

  if (!isPro && !isActiveTrial && !isCanceledInGrace) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Este configurador no está disponible en este momento.
      </div>
    );
  }

  return (
    <div
      style={{
        '--accent': tenant.themeAccent || '#0b5faa',
        '--navy': tenant.themeNavy || '#0a2540',
        '--text': tenant.themeText || '#0a1e3d',
      } as React.CSSProperties}
    >
      <EmbedConfigurator apiKey={key} tenant={tenant} />
    </div>
  );
}
