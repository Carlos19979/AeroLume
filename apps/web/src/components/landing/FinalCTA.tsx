'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
    return (
        <section className="relative bg-[var(--color-ink)] text-[var(--color-paper)] py-24 lg:py-32 overflow-hidden">
            <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="grid lg:grid-cols-12 gap-10 items-end border-t border-[var(--color-paper)]/30 pt-8">
                    <div className="lg:col-span-3">
                        <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                            §07
                        </span>
                        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-paper)]/55 mt-2">
                            Colofon
                        </p>
                    </div>
                    <div className="lg:col-span-9">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="text-[2.75rem] sm:text-[4rem] lg:text-[5.5rem] leading-[0.98] tracking-[-0.025em] text-[var(--color-paper)]"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                        >
                            Embebe el configurador
                            <br />
                            <span className="italic font-light text-[var(--color-paper)]/85">
                                en tu web esta semana.
                            </span>
                        </motion.h2>
                    </div>
                </div>

                <div className="mt-14 lg:mt-20 grid lg:grid-cols-12 gap-10 items-end">
                    <div className="lg:col-span-7 lg:col-start-4">
                        <p className="text-[16px] lg:text-[18px] leading-[1.55] text-[var(--color-paper)]/65 max-w-[44ch]">
                            7 dias gratis. Sin tarjeta. Sin compromiso. Setup acompañado.
                            Si no encaja con tu negocio, te devolvemos los datos y borramos la cuenta.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                            <Link
                                href="/signup"
                                className="group inline-flex items-center gap-3 bg-[var(--color-paper)] text-[var(--color-ink)] pl-5 pr-4 py-3.5 text-[13px] tracking-[0.02em] font-medium hover:bg-[var(--color-signal)] hover:text-[var(--color-paper)] transition-colors"
                            >
                                Registrate gratis
                                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/contact"
                                className="text-[13px] tracking-[0.02em] text-[var(--color-paper)] border-b border-[var(--color-paper)]/40 pb-1 hover:border-[var(--color-paper)] transition-colors"
                            >
                                Hablar con nosotros
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom meta */}
                <div className="mt-20 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-t border-[var(--color-paper)]/15 pt-6">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-paper)]/45">
                        <span>Sin compromiso</span>
                        <span className="block h-px w-3 bg-[var(--color-paper)]/25" />
                        <span>Setup en 48h</span>
                        <span className="block h-px w-3 bg-[var(--color-paper)]/25" />
                        <span>Soporte incluido</span>
                    </div>
                    <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-paper)]/45">
                        §07 · Aerolume / Edicion 04 · MMXXVI
                    </span>
                </div>
            </div>
        </section>
    );
}
