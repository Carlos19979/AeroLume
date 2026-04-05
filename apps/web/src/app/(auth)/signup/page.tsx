'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();

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

        const res = await fetch('/api/internal/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: companyName || `${name}'s Workspace`,
                companyName: companyName || null,
                phone: phone || null,
                website: website || null,
                country: country || null,
                city: city || null,
            }),
        });

        if (!res.ok) {
            setError('Cuenta creada pero hubo un error al crear el workspace. Contacta soporte.');
            setLoading(false);
            return;
        }

        router.push('/dashboard');
    }

    const inputClass = "w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#0b5faa]/50 focus:border-transparent outline-none transition-all";

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
                        Crear cuenta
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        Empieza a configurar tu veleria
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Nombre *</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                className={inputClass} placeholder="Tu nombre" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Empresa</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                className={inputClass} placeholder="Tu veleria" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Email *</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className={inputClass} placeholder="tu@email.com" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Contraseña *</label>
                        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                            className={inputClass} placeholder="Minimo 8 caracteres" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Telefono</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                className={inputClass} placeholder="+34 600 000 000" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Web</label>
                            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                                className={inputClass} placeholder="tuveleria.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Pais</label>
                            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                                className={inputClass} placeholder="España" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Ciudad</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                                className={inputClass} placeholder="Valencia" />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white text-[#0a2540] rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                Creando cuenta...
                            </span>
                        ) : 'Crear cuenta'}
                    </button>
                </form>

                <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
                    <p className="text-sm text-white/30">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-white/60 hover:text-white font-medium transition-colors">
                            Inicia sesion
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
