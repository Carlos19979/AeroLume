'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [name, setName] = useState('');
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

        // 1. Sign up user
        const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });

        if (signupError) {
            setError(signupError.message);
            setLoading(false);
            return;
        }

        if (!data.user) {
            setError('Error al crear la cuenta');
            setLoading(false);
            return;
        }

        // 2. Create tenant + tenant_member via API
        const res = await fetch('/api/internal/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `${name}'s Workspace` }),
        });

        if (!res.ok) {
            setError('Cuenta creada pero hubo un error al crear el workspace. Contacta soporte.');
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
                    Crea tu cuenta y empieza a configurar
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
                        placeholder="Tu nombre o empresa"
                    />
                </div>

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
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none"
                        placeholder="Mínimo 8 caracteres"
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
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-[var(--accent)] hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </form>
        </div>
    );
}
