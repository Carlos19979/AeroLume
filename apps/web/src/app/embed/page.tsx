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
      logoUrl: tenants.logoUrl,
      locale: tenants.locale,
      currency: tenants.currency,
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
