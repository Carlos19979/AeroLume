'use client';

import { motion } from 'framer-motion';

const STEPS = [
    {
        num: '01',
        title: 'Configuramos tu cuenta',
        body: 'Subimos tus productos, precios y marca. Personalizamos colores y tipografia. El widget queda 100% tuyo.',
        meta: 'T+0 → T+48h',
    },
    {
        num: '02',
        title: 'Integras el widget',
        body: 'Pegas tres lineas de codigo en tu web. El configurador se adapta al ancho del contenedor donde lo embebes.',
        meta: '3 lineas · 3.4 KB',
    },
    {
        num: '03',
        title: 'Empiezas a recibir leads',
        body: 'Cada cliente que configura se convierte en un presupuesto en tu dashboard, con margen calculado y datos completos.',
        meta: 'Webhook + email',
    },
];

export function HowItWorks() {
    return (
        <section
            id="como-funciona"
            className="relative bg-[var(--color-ink)] text-[var(--color-paper)] py-24 lg:py-32 overflow-hidden"
        >
            {/* Faint chart grid in deep ink */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, var(--color-paper) 1px, transparent 1px), linear-gradient(to bottom, var(--color-paper) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }}
                aria-hidden="true"
            />

            <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
                {/* Section header */}
                <div className="grid lg:grid-cols-12 gap-10 mb-16 lg:mb-20 border-t border-[var(--color-paper)]/30 pt-8">
                    <div className="lg:col-span-3">
                        <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                            §04
                        </span>
                        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-paper)]/55 mt-2">
                            Como funciona
                        </p>
                    </div>
                    <div className="lg:col-span-6">
                        <h2
                            className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-paper)]"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                        >
                            De nada a configurador <span className="italic font-light text-[var(--color-paper)]/80">en menos de 48 horas.</span>
                        </h2>
                    </div>
                </div>

                {/* Steps as horizontal manual columns */}
                <ol className="grid md:grid-cols-3 gap-px bg-[var(--color-paper)]/25 border border-[var(--color-paper)]/25">
                    {STEPS.map((step, i) => (
                        <motion.li
                            key={step.num}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="relative bg-[var(--color-ink)] p-8 lg:p-10"
                        >
                            <div className="flex items-baseline justify-between mb-8">
                                <span
                                    className="text-[5rem] leading-[0.8] text-[var(--color-paper)]"
                                    style={{
                                        fontFamily: 'var(--font-fraunces), Georgia, serif',
                                        fontFeatureSettings: '"tnum"',
                                    }}
                                >
                                    {step.num}
                                </span>
                                <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-signal)]">
                                    {step.meta}
                                </span>
                            </div>

                            <h3
                                className="text-[1.5rem] lg:text-[1.75rem] leading-[1.1] tracking-[-0.01em] text-[var(--color-paper)] mb-4"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                {step.title}
                            </h3>
                            <p className="text-[14px] leading-[1.65] text-[var(--color-paper)]/65 max-w-[34ch]">
                                {step.body}
                            </p>

                            {/* Vertical step thread on mobile */}
                            {i < STEPS.length - 1 && (
                                <div
                                    className="md:hidden absolute left-0 right-0 bottom-0 h-px bg-[var(--color-paper)]/15"
                                    aria-hidden="true"
                                />
                            )}
                        </motion.li>
                    ))}
                </ol>

                {/* Footer note */}
                <div className="mt-14 flex items-center justify-between border-t border-[var(--color-paper)]/15 pt-6">
                    <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-paper)]/45">
                        Acompanamiento 1-a-1 · No tienes que hacerlo solo
                    </p>
                    <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-paper)]/45 hidden md:inline">
                        §04 / Aerolume / Edicion 04
                    </span>
                </div>
            </div>
        </section>
    );
}
