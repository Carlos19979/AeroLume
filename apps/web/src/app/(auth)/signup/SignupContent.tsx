'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

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
    const [showPassword, setShowPassword] = useState(false);

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

    const inputClass =
        'w-full px-4 py-3 bg-white border border-[var(--color-rule-strong)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] focus:border-[var(--color-ink)] focus:outline-none transition-colors duration-150';

    if (emailSent) {
        return (
            <div className="w-full max-w-[420px]">
                {/* Section marker */}
                <div className="flex items-center gap-3 mb-8">
                    <span
                        className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--color-signal)]"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        §02
                    </span>
                    <span className="h-px w-8 bg-[var(--color-signal)] opacity-40" />
                    <span
                        className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--color-ink-3)]"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        Confirmacion
                    </span>
                </div>

                <h1
                    className="text-[2.5rem] font-light leading-[1.0] tracking-[-0.02em] text-[var(--color-ink)] mb-6"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"ss01"' }}
                >
                    Revisa tu{' '}
                    <em className="not-italic text-[var(--color-signal)]">email</em>
                </h1>

                <p className="text-sm leading-relaxed text-[var(--color-ink-3)] mb-8">
                    Hemos enviado un enlace de confirmacion a{' '}
                    <strong className="text-[var(--color-ink)] font-medium">{email}</strong>.
                    Haz clic en el para activar tu cuenta.
                </p>

                <div className="hairline mb-7" />

                <Link
                    href="/login"
                    className="inline-block text-sm text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-signal)] transition-colors"
                >
                    Ir a iniciar sesion
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[480px]">
            {/* Section marker */}
            <div className="flex items-center gap-3 mb-8">
                <span
                    className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--color-signal)]"
                    style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                >
                    §02
                </span>
                <span className="h-px w-8 bg-[var(--color-signal)] opacity-40" />
                <span
                    className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--color-ink-3)]"
                    style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                >
                    Registro
                </span>
            </div>

            {/* Headline */}
            <h1
                className="text-[2.5rem] font-light leading-[1.0] tracking-[-0.02em] text-[var(--color-ink)] mb-8"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"ss01"' }}
            >
                Crear tu{' '}
                <em className="not-italic text-[var(--color-signal)]">cuenta</em>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre + Empresa */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="signup-name" className="label-mono block mb-2">
                            Nombre *
                        </label>
                        <input
                            id="signup-name"
                            type="text"
                            required
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-company" className="label-mono block mb-2">
                            Empresa *
                        </label>
                        <input
                            id="signup-company"
                            type="text"
                            required
                            autoComplete="organization"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className={inputClass}
                            placeholder="Tu veleria"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="signup-email" className="label-mono block mb-2">
                        Email *
                    </label>
                    <input
                        id="signup-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="tu@email.com"
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="signup-password" className="label-mono block mb-2">
                        Contrasena *
                    </label>
                    <div className="relative">
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass} pr-11`}
                            placeholder="Minimo 8 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            aria-pressed={showPassword}
                            tabIndex={-1}
                            className="absolute inset-y-0 right-2 flex items-center px-2 text-[var(--color-ink-4)] hover:text-[var(--color-ink)] transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Phone + Website */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="signup-phone" className="label-mono block mb-2">
                            Telefono
                        </label>
                        <input
                            id="signup-phone"
                            type="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                            placeholder="+34 611 234 567"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-website" className="label-mono block mb-2">
                            Web
                        </label>
                        <input
                            id="signup-website"
                            type="url"
                            autoComplete="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={inputClass}
                            placeholder="tuveleria.com"
                        />
                    </div>
                </div>

                {/* Country + City */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="signup-country" className="label-mono block mb-2">
                            Pais
                        </label>
                        <input
                            id="signup-country"
                            type="text"
                            autoComplete="country-name"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={inputClass}
                            placeholder="España"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-city" className="label-mono block mb-2">
                            Ciudad
                        </label>
                        <input
                            id="signup-city"
                            type="text"
                            autoComplete="address-level2"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={inputClass}
                            placeholder="Valencia"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm px-4 py-3 border-l-2 border-[var(--color-signal)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)]">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide hover:bg-[var(--color-ink-2)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border border-[var(--color-paper)] border-t-transparent rounded-full animate-spin" />
                            Creando cuenta...
                        </span>
                    ) : 'Crear cuenta'}
                </button>
            </form>

            {/* Hairline divider */}
            <div className="hairline my-7" />

            <p className="text-sm text-[var(--color-ink-3)]">
                &iquest;Ya tienes cuenta?{' '}
                <Link
                    href="/login"
                    className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-signal)] transition-colors"
                >
                    Inicia sesion
                </Link>
            </p>
        </div>
    );
}
