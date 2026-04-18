'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/format';

type ApiKeyRow = {
  id: string;
  keyPrefix: string;
  name: string;
  scopes: string[] | null;
  rateLimit: number | null;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date | null;
};

export function ApiKeysClient({ initialKeys }: { initialKeys: ApiKeyRow[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      setError(null);
      const res = await fetch('/api/internal/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();

      setCreatedKey(data.rawKey);
      setKeys((prev) => [
        {
          id: data.id,
          keyPrefix: data.keyPrefix,
          name: data.name,
          scopes: ['read'],
          rateLimit: 1000,
          lastUsedAt: null,
          expiresAt: null,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);
      setNewKeyName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('¿Revocar esta API key? Los widgets que la usen dejarán de funcionar.')) return;
    try {
      setError(null);
      const res = await fetch(`/api/internal/api-keys?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Created key banner — shown once */}
      {createdKey && (
        <div data-testid="apikey-raw-modal" className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            API key creada. Cópiala ahora — no podrás verla de nuevo.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm font-mono text-gray-900 select-all">
              {createdKey}
            </code>
            <button
              data-testid="apikey-copy-raw"
              onClick={() => copyToClipboard(createdKey)}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              Copiar
            </button>
            <button
              onClick={() => setCreatedKey(null)}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Create new key — only if no keys exist */}
      {keys.length > 0 ? null : showCreate ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Nueva API Key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre (ej: Producción, Staging...)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !newKeyName.trim()}
              className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewKeyName(''); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          data-testid="apikey-create-btn"
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90"
        >
          + Nueva API Key
        </button>
      )}

      {/* Keys table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {keys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tienes API keys. Crea una para empezar.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Key</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Último uso</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Creada</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((key) => (
                <tr key={key.id} data-testid={`apikey-row-${key.id}`}>
                  <td className="px-4 py-3 text-gray-900">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {key.keyPrefix}...
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {key.lastUsedAt
                      ? formatDate(key.lastUsedAt)
                      : 'Nunca'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {key.createdAt
                      ? formatDate(key.createdAt)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      data-testid={`apikey-revoke-${key.id}`}
                      onClick={() => handleRevoke(key.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Revocar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Usage snippet */}
      {keys.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Uso</h3>
          <p className="text-sm text-gray-500 mb-4">
            Incluye tu API key en las peticiones con el header <code className="bg-gray-100 px-1 rounded text-xs">x-api-key</code>:
          </p>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`curl https://api.aerolume.com/v1/boats/search?query=Bavaria \\
  -H "x-api-key: ak_tu_api_key_aqui"`}
          </pre>
        </div>
      )}
    </>
  );
}
