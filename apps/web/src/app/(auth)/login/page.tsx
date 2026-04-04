'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push('/dashboard');
    }

    return (
        <div className="w-full max-w-md px-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-cormorant)]">
                    Aerolume
                </h1>
                <p className="text-white/60 mt-2 text-sm">
                    Accede a tu panel de control
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
                        placeholder="tu@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
                        placeholder="••••••••"
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
                    className="w-full py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-50"
                >
                    {loading ? 'Entrando...' : 'Iniciar sesión'}
                </button>

                <div className="text-center text-sm text-gray-500 space-y-2">
                    <Link href="/forgot-password" className="block hover:text-[var(--accent)]">
                        ¿Olvidaste tu contraseña?
                    </Link>
                    <p>
                        ¿No tienes cuenta?{' '}
                        <Link href="/signup" className="text-[var(--accent)] hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
