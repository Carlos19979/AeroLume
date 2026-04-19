'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginContent() {
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
        <div className="w-full max-w-[420px]">
            {/* Section marker */}
            <div className="flex items-center gap-3 mb-8">
                <span
                    className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--color-signal)]"
                    style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                >
                    §01
                </span>
                <span className="h-px w-8 bg-[var(--color-signal)] opacity-40" />
                <span
                    className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--color-ink-3)]"
                    style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                >
                    Acceso
                </span>
            </div>

            {/* Headline */}
            <h1
                className="text-[2.5rem] font-light leading-[1.0] tracking-[-0.02em] text-[var(--color-ink)] mb-8"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"ss01"' }}
            >
                Iniciar{' '}
                <em className="not-italic text-[var(--color-signal)]">sesion</em>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="email"
                        className="label-mono block mb-2"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[var(--color-rule-strong)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] focus:border-[var(--color-ink)] focus:outline-none transition-colors duration-150"
                        placeholder="tu@email.com"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="label-mono block mb-2"
                    >
                        Contrasena
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[var(--color-rule-strong)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] focus:border-[var(--color-ink)] focus:outline-none transition-colors duration-150"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div
                        className="text-sm px-4 py-3 border-l-2 border-[var(--color-signal)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)]"
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide hover:bg-[var(--color-ink-2)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border border-[var(--color-paper)] border-t-transparent rounded-full animate-spin" />
                            Entrando...
                        </span>
                    ) : 'Iniciar sesion'}
                </button>
            </form>

            {/* Hairline divider */}
            <div className="hairline my-7" />

            <div className="space-y-2 text-sm text-[var(--color-ink-3)]">
                <Link
                    href="/forgot-password"
                    className="block hover:text-[var(--color-ink)] transition-colors"
                >
                    &iquest;Olvidaste tu contrasena?
                </Link>
                <p>
                    &iquest;No tienes cuenta?{' '}
                    <Link
                        href="/signup"
                        className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-signal)] transition-colors"
                    >
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
}
