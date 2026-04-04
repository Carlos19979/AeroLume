'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Wind } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
            {/* Background gradients */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(11,95,170,0.08),transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(11,95,170,0.04),transparent_60%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-px glow-line opacity-15" />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        'linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 lg:py-40">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-accent)]/15 bg-[var(--color-accent-light)] px-4 py-2"
                    >
                        <Wind className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
                            Configurador de velas
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="mt-8 font-[var(--font-display)] text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.88] tracking-[-0.02em]"
                    >
                        <span className="text-[var(--color-text)]">La vela</span>
                        <br />
                        <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dim)] bg-clip-text text-transparent">
                            exacta
                        </span>
                        <br />
                        <span className="text-[var(--color-text)]">para tu barco.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="mt-10 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)]"
                    >
                        Busca tu modelo entre mas de 4.000 barcos, revisa las cotas del aparejo y compara
                        propuestas reales de velas — todo en un solo flujo.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="mt-12 flex flex-wrap gap-4"
                    >
                        <Link
                            href="/configurator"
                            className="group inline-flex items-center gap-3 rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-[var(--color-accent-dim)] hover:shadow-[0_8px_40px_rgba(11,95,170,0.3)] hover:scale-[1.02]"
                        >
                            Configurar ahora
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center gap-3 rounded-full border border-[var(--color-border-strong)] px-8 py-4 text-sm uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-accent)]/30 hover:text-[var(--color-text)]"
                        >
                            Saber mas
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mt-24 grid grid-cols-2 gap-px rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden lg:grid-cols-4"
                >
                    {[
                        { value: '4.000+', label: 'Modelos de barcos' },
                        { value: '9', label: 'Tipos de vela' },
                        { value: '100%', label: 'Datos verificados' },
                        { value: '24h', label: 'Cache de productos' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-6 lg:p-8">
                            <div className="font-[var(--font-display)] text-3xl font-light text-[var(--color-accent)]">
                                {stat.value}
                            </div>
                            <div className="mt-2 text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
