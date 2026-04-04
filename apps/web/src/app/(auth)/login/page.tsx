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
        <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
                <a href="/" className="inline-flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L4 20h16L12 2z" opacity="0.3" fill="white" />
                            <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-[0.15em] uppercase text-white font-[family-name:var(--font-cormorant)]">
                        Aerolume
                    </span>
                </a>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-8 shadow-2xl shadow-black/20">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-cormorant)]">
                        Bienvenido
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        Accede a tu panel de control
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#0b5faa]/50 focus:border-transparent outline-none transition-all"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#0b5faa]/50 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white text-[#0a2540] rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                Entrando...
                            </span>
                        ) : 'Iniciar sesion'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-sm space-y-2">
                    <Link href="/forgot-password" className="block text-white/30 hover:text-white/60 transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                    <p className="text-white/30">
                        ¿No tienes cuenta?{' '}
                        <Link href="/signup" className="text-white/60 hover:text-white font-medium transition-colors">
                            Registrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
