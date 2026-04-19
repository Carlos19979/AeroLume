'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';

/**
 * Editorial nautico pricing page.
 *
 * Locked invariants (E2E):
 *  - h1 has data-testid="pricing-hero-heading"
 *  - tier containers: data-testid="pricing-tier-trial" / "pricing-tier-pro"
 *  - CTAs: data-testid="pricing-cta-trial" / "pricing-cta-pro" → /signup
 *  - Pro tier contains text matching /recomendado/i
 */

const TRIAL_FEATURES = [
    'Acceso completo durante 7 dias',
    'Configurador embebible white-label',
    'Hasta 20 productos',
    'Generacion de presupuestos PDF',
    'Soporte por email',
];

const PRO_FEATURES = [
    'Todo lo del periodo de prueba',
    'Productos ilimitados',
    'Analitica de configuraciones',
    'Webhooks personalizables',
    'Acceso a la API REST',
    'Soporte prioritario',
    'Sin permanencia, cancelas cuando quieras',
];

const FAQS = [
    {
        q: '¿Que pasa cuando termina el periodo de prueba?',
        a: 'Puedes suscribirte al plan Pro para seguir sin interrupciones. Si no te suscribes, tu cuenta queda pausada y conservamos tus datos durante 30 dias.',
    },
    {
        q: '¿Hay permanencia o penalizacion por cancelar?',
        a: 'Ninguna. El plan Pro es mensual y se cancela en cualquier momento desde el panel. Sin letra pequena.',
    },
    {
        q: '¿Los 300 EUR/mes incluyen IVA?',
        a: 'No. El precio indicado es sin IVA. El IVA aplicable depende del pais de facturacion de tu empresa.',
    },
    {
        q: '¿Puedo cambiar de plan mas adelante?',
        a: 'Si. Empieza con la prueba gratuita y suscribete cuando estes listo. No hay planes intermedios ni costes ocultos.',
    },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[var(--color-rule)]">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls={`pricing-faq-answer-${index}`}
                className="flex items-baseline justify-between w-full py-6 text-left gap-6 group"
            >
                <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-ink-3)] shrink-0 w-12">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span
                    className="flex-1 text-[19px] lg:text-[22px] leading-[1.25] text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                    {q}
                </span>
                <Plus
                    size={18}
                    className={`text-[var(--color-ink)] shrink-0 mt-1 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
                />
            </button>
            <div
                id={`pricing-faq-answer-${index}`}
                role="region"
                aria-hidden={!open}
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open ? '320px' : '0', opacity: open ? 1 : 0 }}
            >
                <div className="pb-6 pl-[72px] pr-8 max-w-[60ch]">
                    <p className="text-[14.5px] leading-[1.6] text-[var(--color-ink-2)]">{a}</p>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <div className="bg-[var(--color-paper)]">
            {/* ── §01 · Hero ─────────────────────────── */}
            <section className="relative overflow-hidden pt-32 lg:pt-40 pb-20 lg:pb-24">
                <div className="absolute inset-0 bg-chart-grid opacity-60 pointer-events-none" aria-hidden="true" />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse 90% 70% at 50% 30%, transparent 30%, var(--color-paper) 100%)',
                    }}
                    aria-hidden="true"
                />

                <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
                    {/* Top meta strip */}
                    <div className="flex items-center justify-between border-t border-b border-[var(--color-rule)] py-2.5 mb-12 lg:mb-16">
                        <span className="label-mono">Pricing 2026</span>
                        <span className="label-mono hidden md:inline">Plan unico · Sin permanencia</span>
                        <span className="label-mono">Edicion 04</span>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="lg:col-span-8"
                        >
                            <div className="flex items-baseline gap-3 mb-7">
                                <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                    §01
                                </span>
                                <span className="h-px flex-1 max-w-[80px] bg-[var(--color-rule-strong)]" />
                                <span className="label-mono">Tarifas</span>
                            </div>

                            <h1
                                data-testid="pricing-hero-heading"
                                className="text-[3rem] sm:text-[4.25rem] lg:text-[5.5rem] font-light leading-[0.95] tracking-[-0.025em] text-[var(--color-ink)]"
                                style={{
                                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                                    fontFeatureSettings: '"ss01"',
                                }}
                            >
                                Planes simples,
                                <br />
                                <span
                                    className="italic font-normal text-[var(--color-signal)]"
                                    style={{ fontVariationSettings: '"opsz" 144' }}
                                >
                                    sin sorpresas.
                                </span>
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="lg:col-span-4 lg:pt-6"
                        >
                            <p className="text-[16px] leading-[1.6] text-[var(--color-ink-2)] max-w-[36ch]">
                                Prueba gratis durante 7 dias con acceso completo. Cuando estes listo, un unico plan Pro
                                sin letra pequena.
                            </p>

                            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--color-rule)] pt-5">
                                <div>
                                    <span className="label-mono">Setup</span>
                                    <p
                                        className="mt-1 text-[20px] text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                    >
                                        48h
                                    </p>
                                </div>
                                <div>
                                    <span className="label-mono">Permanencia</span>
                                    <p
                                        className="mt-1 text-[20px] text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                    >
                                        Cero
                                    </p>
                                </div>
                                <div>
                                    <span className="label-mono">Tarjeta</span>
                                    <p
                                        className="mt-1 text-[20px] text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                    >
                                        No
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── §02 · Tiers ────────────────────────── */}
            <section className="relative bg-[var(--color-paper)] pb-24 lg:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 mb-14 lg:mb-16 border-t border-[var(--color-ink)] pt-8">
                        <div className="lg:col-span-3">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §02
                            </span>
                            <p className="label-mono mt-2">Los planes</p>
                        </div>
                        <div className="lg:col-span-6">
                            <h2
                                className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Dos puertas. Una <span className="italic font-light">misma plataforma.</span>
                            </h2>
                        </div>
                        <div className="lg:col-span-3 lg:pt-3">
                            <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                                Empieza por la prueba. Pasa a Pro cuando el primer presupuesto entre por el widget.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 border-t-2 border-[var(--color-ink)]">
                        {/* ── Tier 01 · Trial ────────── */}
                        <motion.article
                            data-testid="pricing-tier-trial"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="relative border-b md:border-b-0 md:border-r border-[var(--color-rule-strong)] p-8 lg:p-12 group hover:bg-[var(--color-paper-2)]/40 transition-colors"
                        >
                            <div className="flex items-baseline justify-between mb-10">
                                <span
                                    className="text-[5rem] lg:text-[6rem] leading-[0.85] text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors"
                                    style={{
                                        fontFamily: 'var(--font-fraunces), Georgia, serif',
                                        fontFeatureSettings: '"tnum"',
                                    }}
                                >
                                    01
                                </span>
                                <span className="label-mono">Prueba</span>
                            </div>

                            <h3
                                className="text-[1.75rem] lg:text-[2.25rem] leading-[1.05] tracking-[-0.015em] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Periodo de prueba
                            </h3>
                            <p className="mt-3 text-[14px] leading-[1.6] text-[var(--color-ink-2)] max-w-[40ch]">
                                Acceso completo a la plataforma. Sin tarjeta de credito, sin compromiso.
                            </p>

                            <div className="mt-10 border-t border-[var(--color-rule)] pt-6 flex items-baseline gap-2">
                                <span
                                    className="text-[3.5rem] lg:text-[4.5rem] leading-[0.85] text-[var(--color-ink)]"
                                    style={{
                                        fontFamily: 'var(--font-fraunces), Georgia, serif',
                                        fontFeatureSettings: '"tnum"',
                                    }}
                                >
                                    0 €
                                </span>
                                <span className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--color-ink-3)]">
                                    / 7 dias
                                </span>
                            </div>

                            <ul className="mt-10 space-y-3">
                                {TRIAL_FEATURES.map((feature, i) => (
                                    <li
                                        key={feature}
                                        className="flex items-baseline gap-4 text-[14px] leading-[1.55] text-[var(--color-ink-2)]"
                                    >
                                        <span className="font-mono text-[10.5px] tracking-[0.08em] text-[var(--color-ink-3)] shrink-0 pt-[1px]">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-12">
                                <Link
                                    data-testid="pricing-cta-trial"
                                    href="/signup"
                                    className="group/cta inline-flex items-center gap-3 border border-[var(--color-ink)] text-[var(--color-ink)] pl-5 pr-4 py-3.5 text-[13px] tracking-[0.02em] font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] transition-colors"
                                >
                                    Empezar gratis
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform group-hover/cta:translate-x-1"
                                    />
                                </Link>
                            </div>
                        </motion.article>

                        {/* ── Tier 02 · Pro ──────────── */}
                        <motion.article
                            data-testid="pricing-tier-pro"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="relative bg-[var(--color-ink)] text-[var(--color-paper)] p-8 lg:p-12 overflow-hidden"
                        >
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, var(--color-paper) 1px, transparent 1px), linear-gradient(to bottom, var(--color-paper) 1px, transparent 1px)',
                                    backgroundSize: '60px 60px',
                                }}
                                aria-hidden="true"
                            />

                            <div className="relative">
                                <div className="flex items-baseline justify-between mb-10">
                                    <span
                                        className="text-[5rem] lg:text-[6rem] leading-[0.85] text-[var(--color-paper)]"
                                        style={{
                                            fontFamily: 'var(--font-fraunces), Georgia, serif',
                                            fontFeatureSettings: '"tnum"',
                                        }}
                                    >
                                        02
                                    </span>
                                    <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[var(--color-signal)] font-medium">
                                        Recomendado
                                    </span>
                                </div>

                                <h3
                                    className="text-[1.75rem] lg:text-[2.25rem] leading-[1.05] tracking-[-0.015em] text-[var(--color-paper)]"
                                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                >
                                    Plan Pro
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.6] text-[var(--color-paper)]/65 max-w-[40ch]">
                                    Todo Aerolume, sin limites. Soporte prioritario y API completa.
                                </p>

                                <div className="mt-10 border-t border-[var(--color-paper)]/20 pt-6 flex items-baseline gap-2">
                                    <span
                                        className="text-[3.5rem] lg:text-[4.5rem] leading-[0.85] text-[var(--color-signal)]"
                                        style={{
                                            fontFamily: 'var(--font-fraunces), Georgia, serif',
                                            fontFeatureSettings: '"tnum"',
                                        }}
                                    >
                                        300 €
                                    </span>
                                    <span className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--color-paper)]/55">
                                        / mes
                                    </span>
                                </div>

                                <ul className="mt-10 space-y-3">
                                    {PRO_FEATURES.map((feature, i) => (
                                        <li
                                            key={feature}
                                            className="flex items-baseline gap-4 text-[14px] leading-[1.55] text-[var(--color-paper)]/80"
                                        >
                                            <span className="font-mono text-[10.5px] tracking-[0.08em] text-[var(--color-signal)] shrink-0 pt-[1px]">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-12">
                                    <Link
                                        data-testid="pricing-cta-pro"
                                        href="/signup"
                                        className="group/cta inline-flex items-center gap-3 bg-[var(--color-paper)] text-[var(--color-ink)] pl-5 pr-4 py-3.5 text-[13px] tracking-[0.02em] font-medium hover:bg-[var(--color-signal)] hover:text-[var(--color-paper)] transition-colors"
                                    >
                                        Suscribirse
                                        <ArrowRight
                                            size={15}
                                            className="transition-transform group-hover/cta:translate-x-1"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    </div>

                    {/* Reassurance strip */}
                    <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[var(--color-rule)] pt-6">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-ink-3)]">
                            <span>Sin tarjeta en la prueba</span>
                            <span className="block h-px w-3 bg-[var(--color-rule-strong)]" />
                            <span>Setup en 48h</span>
                            <span className="block h-px w-3 bg-[var(--color-rule-strong)]" />
                            <span>Cancelacion inmediata</span>
                            <span className="block h-px w-3 bg-[var(--color-rule-strong)]" />
                            <span>Soporte incluido</span>
                        </div>
                        <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-ink-3)] hidden md:inline">
                            §02 / Aerolume / MMXXVI
                        </span>
                    </div>
                </div>
            </section>

            {/* ── §03 · FAQ ──────────────────────────── */}
            <section className="relative bg-[var(--color-paper)] py-24 lg:py-32">
                <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 mb-12 border-t border-[var(--color-ink)] pt-8">
                        <div className="lg:col-span-4">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §03
                            </span>
                            <p className="label-mono mt-2">Apendice</p>
                            <h2
                                className="mt-4 text-[2rem] lg:text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Preguntas <span className="italic font-light">frecuentes.</span>
                            </h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-8 border-t border-[var(--color-ink)]"
                        >
                            {FAQS.map((item, index) => (
                                <FAQItem key={item.q} q={item.q} a={item.a} index={index} />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
