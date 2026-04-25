'use client';

import { motion } from 'framer-motion';

const ROWS = [
    {
        metric: '+40%',
        label: 'mas solicitudes de presupuesto',
        body: 'Los clientes configuran y solicitan desde tu web, sin llamadas, sin email tag.',
        ref: 'M-01',
    },
    {
        metric: '−75%',
        label: 'tiempo dedicado a presupuestar',
        body: 'El configurador hace el trabajo de medicion y calculo. Tu revisas y envias.',
        ref: 'M-02',
    },
    {
        metric: '24 / 7',
        label: 'disponibilidad del configurador',
        body: 'Trabaja mientras duermes. Los clientes configuran cuando les viene bien.',
        ref: 'M-03',
    },
    {
        metric: '4 839',
        label: 'modelos de barco con datos verificados',
        body: 'P, E, I, J y eslora confirmados para velerias, regatas y cruceros.',
        ref: 'M-04',
    },
];

export function Results() {
    return (
        <section className="relative bg-[var(--color-paper)] py-24 lg:py-32">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="grid lg:grid-cols-12 gap-10 mb-14 border-t border-[var(--color-ink)] pt-8">
                    <div className="lg:col-span-3">
                        <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                            §05
                        </span>
                        <p className="label-mono mt-2">Resultados medidos</p>
                    </div>
                    <div className="lg:col-span-6">
                        <h2
                            className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                        >
                            Lo que cambia <span className="italic font-light">cuando lo instalas.</span>
                        </h2>
                    </div>
                </div>

                <div className="border-t-2 border-[var(--color-ink)]">
                    <div className="grid grid-cols-[48px_1fr_0_32px] sm:grid-cols-[64px_1fr_1.6fr_44px] md:grid-cols-[80px_1fr_2fr_60px] gap-3 sm:gap-4 md:gap-6 py-3 border-b border-[var(--color-ink)] label-mono">
                        <span>Ref.</span>
                        <span>Metrica</span>
                        <span className="hidden md:block">Lectura</span>
                        <span className="text-right">Δ</span>
                    </div>

                    {ROWS.map((row, i) => (
                        <motion.div
                            key={row.ref}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                            className="grid grid-cols-[48px_1fr_0_32px] sm:grid-cols-[64px_1fr_1.6fr_44px] md:grid-cols-[80px_1fr_2fr_60px] gap-3 sm:gap-4 md:gap-6 py-7 lg:py-8 border-b border-[var(--color-rule)] items-baseline group hover:bg-[var(--color-paper-2)]/50 transition-colors"
                        >
                            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-ink-3)] pt-2">
                                {row.ref}
                            </span>

                            <div>
                                <div
                                    className="text-[1.75rem] sm:text-[2rem] lg:text-[3rem] leading-[0.95] text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors whitespace-nowrap"
                                    style={{
                                        fontFamily: 'var(--font-fraunces), Georgia, serif',
                                        fontFeatureSettings: '"tnum"',
                                    }}
                                >
                                    {row.metric}
                                </div>
                                <div className="mt-2 text-[13px] leading-[1.4] text-[var(--color-ink-2)]">
                                    {row.label}
                                </div>
                            </div>

                            <p className="hidden md:block text-[14px] leading-[1.6] text-[var(--color-ink-2)] pt-3 max-w-[52ch]">
                                {row.body}
                            </p>

                            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-ink-3)] text-right pt-3">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <p className="mt-6 font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
                    † Promedio rolling sobre cuentas activas Q4 2025 — Q1 2026. N = 38 velerias.
                </p>
            </div>
        </section>
    );
}
