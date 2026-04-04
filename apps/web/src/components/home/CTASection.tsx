'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Anchor } from 'lucide-react';

export function CTASection() {
    return (
        <section className="relative py-32 overflow-hidden bg-white">
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative overflow-hidden rounded-3xl bg-[var(--color-navy)]"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

                    <div className="relative px-8 py-20 text-center md:px-16 md:py-28">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/8">
                            <Anchor className="h-7 w-7 text-white/80" />
                        </div>

                        <h2 className="mx-auto mt-8 max-w-3xl font-[var(--font-display)] text-[clamp(2.5rem,5vw,5rem)] font-light leading-[0.92] text-white">
                            Hay una vela esperandote.
                        </h2>

                        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55">
                            Tu barco ya esta en nuestra base de datos. Las cotas, precargadas.
                            Solo falta que elijas.
                        </p>

                        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/configurator"
                                className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-4.5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--color-navy)] transition-all hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                            >
                                Empezar ahora
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="mx-auto mt-16 flex items-center justify-center gap-6 text-xs uppercase tracking-[0.2em] text-white/30">
                            <span>Sin registro</span>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span>Gratis</span>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span>Resultados reales</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
