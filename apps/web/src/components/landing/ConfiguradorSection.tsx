'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EmbedConfigurator } from '@/app/embed/configurator';

const DEMO_TENANT = {
    id: 'demo',
    name: 'Aerolume',
    slug: 'aerolume',
    themeAccent: '#1d4a6b',
    themeAccentDim: '#133b58',
    themeNavy: '#0d1f2d',
    themeText: '#0d1f2d',
    themeFontDisplay: 'Fraunces',
    themeFontBody: 'Inter',
    themeColorMain: '#1d4a6b',
    themeColorHead: '#3a8a5a',
    themeColorSpi: '#c4452d',
    logoUrl: null,
    locale: 'es',
    currency: 'EUR',
};

const DEMO_API_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? '';

export function ConfiguradorSection() {
    return (
        <section id="configurador" className="relative bg-[var(--color-paper-2)] py-24 lg:py-32">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                {/* Section header */}
                <div className="grid lg:grid-cols-12 gap-10 mb-12 lg:mb-16 border-t border-[var(--color-ink)] pt-8">
                    <div className="lg:col-span-3">
                        <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                            §03
                        </span>
                        <p className="label-mono mt-2">Demo en vivo</p>
                    </div>
                    <div className="lg:col-span-6">
                        <h2
                            className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                        >
                            Configura una vela. <span className="italic font-light">Como lo haria tu cliente.</span>
                        </h2>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-[920px] mx-auto"
                >
                    {/* Browser-style chrome with editorial restraint */}
                    <div className="border border-[var(--color-ink)] bg-[var(--color-paper)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-rule-strong)] px-4 py-2">
                            <div className="flex items-center gap-2">
                                <span className="block h-2 w-2 bg-[var(--color-ink)]/30" />
                                <span className="block h-2 w-2 bg-[var(--color-ink)]/30" />
                                <span className="block h-2 w-2 bg-[var(--color-ink)]/30" />
                            </div>
                            <span className="font-mono text-[10.5px] tracking-[0.06em] text-[var(--color-ink-3)]">
                                tuveleria.com / configurador
                            </span>
                            <span className="label-mono">Live</span>
                        </div>

                        {/* Live configurator */}
                        <div className="bg-white">
                            <EmbedConfigurator apiKey={DEMO_API_KEY} tenant={DEMO_TENANT} />
                        </div>
                    </div>

                    {/* Caption */}
                    <p className="mt-3 label-mono text-center">
                        Fig. 01 — Widget embebido en sitio cliente. Lookalike real.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-14"
                >
                    <Link
                        href="/signup"
                        className="group inline-flex items-center gap-3 bg-[var(--color-ink)] text-[var(--color-paper)] pl-5 pr-4 py-3.5 text-[13px] tracking-[0.02em] font-medium hover:bg-[var(--color-signal)] transition-colors"
                    >
                        Crea tu cuenta
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
