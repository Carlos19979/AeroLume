'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  factorId: string | null;
  qrCode: string | null;
  secret: string | null;
}

export function MfaEnrollClient({ factorId: initialFactorId, qrCode: initialQrCode, secret: initialSecret }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [factorId, setFactorId] = useState(initialFactorId);
  const [qrCode, setQrCode] = useState(initialQrCode);
  const [secret, setSecret] = useState(initialSecret);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCodeChange = useCallback(async (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError(null);

    if (digits.length === 6 && factorId) {
      setLoading(true);
      try {
        const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
        if (challengeErr || !challenge) {
          setError(challengeErr?.message ?? 'Error al iniciar el desafío');
          setLoading(false);
          return;
        }
        const { error: verifyErr } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code: digits,
        });
        if (verifyErr) {
          setError('Código incorrecto. Verifica tu reloj y vuelve a intentarlo.');
          setCode('');
          inputRef.current?.focus();
          setLoading(false);
          return;
        }
        router.push('/admin');
        router.refresh();
      } catch {
        setError('Error inesperado. Intenta de nuevo.');
        setLoading(false);
      }
    }
  }, [factorId, supabase, router]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    handleCodeChange(pasted);
  }, [handleCodeChange]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      // Unenroll any existing unverified factor
      if (factorId) {
        await supabase.auth.mfa.unenroll({ factorId }).catch(() => undefined);
      }
      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Aerolume Admin',
      });
      if (enrollErr || !data) {
        setError(enrollErr?.message ?? 'Error al generar el código QR');
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setCode('');
      inputRef.current?.focus();
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.748 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
          </svg>
        </span>
        <h1 className="text-xl font-bold text-gray-900">Configurar autenticación de dos factores</h1>
        <p className="text-sm text-gray-500 mt-1">Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.)</p>
      </div>

      {qrCode && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="p-3 border border-gray-200 rounded-xl bg-white">
            <Image src={qrCode} alt="QR Code TOTP" width={180} height={180} unoptimized />
          </div>
          {secret && (
            <div className="w-full">
              <p className="text-xs text-gray-500 text-center mb-1">O introduce el código manualmente:</p>
              <code className="block text-center text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all select-all">
                {secret}
              </code>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700 mb-2">
          Introduce el código de 6 dígitos
        </label>
        <input
          ref={inputRef}
          id="totp-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onPaste={handlePaste}
          disabled={loading}
          placeholder="000000"
          className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {loading && (
          <p className="mt-2 text-sm text-gray-500 text-center">Verificando...</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleRegenerate}
        disabled={regenerating || loading}
        className="w-full text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 disabled:opacity-50"
      >
        {regenerating ? 'Regenerando...' : 'Volver a generar código QR'}
      </button>
    </div>
  );
}
