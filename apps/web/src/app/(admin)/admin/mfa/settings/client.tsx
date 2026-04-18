'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Factor {
  id: string;
  friendly_name?: string;
  status: string;
  created_at: string;
}

interface Props {
  factors: Factor[];
}

export function MfaSettingsClient({ factors: initialFactors }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [factors, setFactors] = useState(initialFactors);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnenroll = async (factorId: string) => {
    setLoading(factorId);
    setError(null);
    try {
      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollErr) {
        setError(unenrollErr.message);
        return;
      }
      setFactors((prev) => prev.filter((f) => f.id !== factorId));
      setConfirming(null);
      router.refresh();
    } catch {
      setError('Error al eliminar el factor. Intenta de nuevo.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Autenticación en dos pasos</h1>
      <p className="text-sm text-gray-500 mb-6">Gestiona tus factores de autenticación TOTP.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {factors.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No tienes ningún factor 2FA configurado.</p>
          <a href="/admin/mfa" className="mt-2 inline-block text-sm text-red-600 hover:underline">
            Configurar 2FA
          </a>
        </div>
      ) : (
        <ul className="space-y-3">
          {factors.map((factor) => (
            <li key={factor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {factor.friendly_name ?? 'Autenticador TOTP'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Estado: {factor.status === 'verified' ? 'Verificado' : 'Pendiente'} &bull;{' '}
                  {new Date(factor.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                {confirming === factor.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirming(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUnenroll(factor.id)}
                      disabled={loading === factor.id}
                      className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-50"
                    >
                      {loading === factor.id ? 'Eliminando...' : 'Confirmar'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(factor.id)}
                    className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
