import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, apiKeys, eq } from '@aerolume/db';
import { ApiKeysClient } from './client';

export default async function ApiKeysPage() {
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
    .where(eq(apiKeys.tenantId, tenant.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">API Keys</h2>
        <p className="text-gray-500 mt-1">
          Gestiona las claves de acceso para tu widget y API.
        </p>
      </div>
      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
