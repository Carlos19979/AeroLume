'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function SignupContent() {
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
    const [emailSent, setEmailSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();

        const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    company_name: companyName || null,
                    phone: phone || null,
                    website: website || null,
                    country: country || null,
                    city: city || null,
                },
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

        setEmailSent(true);
        setLoading(false);
    }

    const inputClass = "w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#0b5faa]/50 focus:border-transparent outline-none transition-all";

    if (emailSent) {
        return (
            <div className="w-full max-w-sm">
                <div className="lg:hidden text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Logo variant="light" />
                    </Link>
                </div>
                <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-8 shadow-2xl shadow-black/20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-cormorant)]">
                        Revisa tu email
                    </h1>
                    <p className="text-sm text-white/50 mt-3 leading-relaxed">
                        Hemos enviado un enlace de confirmacion a <strong className="text-white/70">{email}</strong>. Haz clic en el para activar tu cuenta.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block mt-6 px-6 py-2.5 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/15 transition-colors"
                    >
                        Ir a iniciar sesion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2">
                    <Logo variant="light" />
                </Link>
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
                            <label htmlFor="signup-name" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Nombre *</label>
                            <input id="signup-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                                className={inputClass} placeholder="Tu nombre" />
                        </div>
                        <div>
                            <label htmlFor="signup-company" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Empresa *</label>
                            <input id="signup-company" type="text" required autoComplete="organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                className={inputClass} placeholder="Tu veleria" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="signup-email" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Email *</label>
                        <input id="signup-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className={inputClass} placeholder="tu@email.com" />
                    </div>

                    <div>
                        <label htmlFor="signup-password" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Contraseña *</label>
                        <input id="signup-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className={inputClass} placeholder="Minimo 8 caracteres" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="signup-phone" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Telefono</label>
                            <input id="signup-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                className={inputClass} placeholder="+34 611 234 567" />
                        </div>
                        <div>
                            <label htmlFor="signup-website" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Web</label>
                            <input id="signup-website" type="url" autoComplete="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                                className={inputClass} placeholder="tuveleria.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="signup-country" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Pais</label>
                            <input id="signup-country" type="text" autoComplete="country-name" value={country} onChange={(e) => setCountry(e.target.value)}
                                className={inputClass} placeholder="España" />
                        </div>
                        <div>
                            <label htmlFor="signup-city" className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">Ciudad</label>
                            <input id="signup-city" type="text" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)}
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
