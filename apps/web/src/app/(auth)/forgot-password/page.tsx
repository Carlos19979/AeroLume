'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSent(true);
        setLoading(false);
    }

    return (
        <div className="w-full max-w-md px-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-cormorant)]">
                    Aerolume
                </h1>
                <p className="text-white/60 mt-2 text-sm">
                    Recupera tu contraseña
                </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
                {sent ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-700 bg-green-50 px-4 py-3 rounded-lg text-sm">
                            Hemos enviado un email a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
                        </p>
                        <Link href="/login" className="text-sm text-[var(--color-accent)] hover:underline">
                            Volver al login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-accent-dim)] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar email de recuperación'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                                Volver al login
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
