import { getAuthenticatedTenant } from '@/lib/auth-page';
import { db, apiKeys, eq } from '@aerolume/db';
import { ApiKeysClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function ApiKeysPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) return null;

  const keys = await db
    .select({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      scopes: apiKeys.scopes,
      rateLimit: apiKeys.rateLimit,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, auth.tenant.id));

  return (
    <div className="space-y-6">
      <PageHeader title="API Keys" description="Gestiona las claves de acceso para tu widget y API." />
      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
