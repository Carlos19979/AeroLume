'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  factorId: string;
  redirectTo: string;
}

export function MfaChallengeClient({ factorId, redirectTo }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCodeChange = useCallback(async (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError(null);

    if (digits.length === 6) {
      setLoading(true);
      try {
        const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: digits,
        });
        if (verifyErr) {
          setError('Código incorrecto. Verifica que tu reloj esté sincronizado e intenta de nuevo.');
          setCode('');
          inputRef.current?.focus();
          setLoading(false);
          return;
        }
        router.push(redirectTo);
        router.refresh();
      } catch {
        setError('Error inesperado. Intenta de nuevo.');
        setLoading(false);
      }
    }
  }, [factorId, supabase, router, redirectTo]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    handleCodeChange(pasted);
  }, [handleCodeChange]);

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </span>
        <h1 className="text-xl font-bold text-gray-900">Verificación en dos pasos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Introduce el código de tu app de autenticación para continuar.
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="totp-challenge" className="block text-sm font-medium text-gray-700 mb-2">
          Código de 6 dígitos
        </label>
        <input
          ref={inputRef}
          id="totp-challenge"
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

      <p className="text-xs text-gray-400 text-center">
        Si perdiste acceso a tu app, contacta a un administrador con acceso a la base de datos.
      </p>
    </div>
  );
}
