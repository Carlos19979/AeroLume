'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Editorial nautico about page.
 *
 * Locked invariants (E2E):
 *  - h1 contains "Tecnologia nautica"
 *  - There exists a heading matching /tres principios/i
 *  - Footer is rendered (provided by marketing layout)
 */

const VALUES = [
    {
        num: '01',
        kicker: 'Precision',
        title: 'Datos verificados, no aproximaciones.',
        body: 'Cada medida del aparejo esta verificada. Mas de 4.800 modelos de barco con P, E, I, J y eslora confirmados. Sin estimaciones, sin sorpresas.',
        spec: ['4 839 modelos', 'P / E / I / J', 'Verificacion manual'],
    },
    {
        num: '02',
        kicker: 'Simplicidad',
        title: 'Un flujo, no un formulario.',
        body: 'La configuracion de velas es compleja. La convertimos en tres pasos visuales: barco, vela, presupuesto. Cualquier cliente lo termina sin ayuda.',
        spec: ['3 pasos', 'Sin onboarding', 'Mobile-first'],
    },
    {
        num: '03',
        kicker: 'Conversion',
        title: 'Cada visita, un presupuesto.',
        body: 'Las llamadas y los emails se pierden. El configurador no. Cada visitante que termina el flujo entra en tu dashboard como lead cualificado, con margen calculado.',
        spec: ['Lead cualificado', 'Margen automatico', 'Webhook + email'],
    },
];

const METRICS = [
    {
        ref: 'M-01',
        metric: '4 839',
        label: 'modelos de barco verificados',
    },
    {
        ref: 'M-02',
        metric: '38',
        label: 'velerias activas en plataforma',
    },
    {
        ref: 'M-03',
        metric: '< 48h',
        label: 'desde firma hasta widget en vivo',
    },
    {
        ref: 'M-04',
        metric: '€0',
        label: 'coste de setup, siempre',
    },
];

export default function AboutContent() {
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
                        <span className="label-mono">Sobre · Equipo · Mision</span>
                        <span className="label-mono hidden md:inline">Valencia · 39° 28&apos; N</span>
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
                                <span className="label-mono">Sobre nosotros</span>
                            </div>

                            <h1
                                className="text-[2.75rem] sm:text-[4rem] lg:text-[5.5rem] font-light leading-[0.95] tracking-[-0.025em] text-[var(--color-ink)]"
                                style={{
                                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                                    fontFeatureSettings: '"ss01"',
                                }}
                            >
                                Tecnologia nautica
                                <br />
                                <span
                                    className="italic font-normal text-[var(--color-signal)]"
                                    style={{ fontVariationSettings: '"opsz" 144' }}
                                >
                                    desde Valencia.
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
                                Construimos el configurador embebible que las velerias venian pidiendo a gritos. Desde el
                                Mediterraneo, para toda Europa.
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--color-rule)] pt-5">
                                <div>
                                    <span className="label-mono">Sede</span>
                                    <p
                                        className="mt-1 text-[20px] text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                    >
                                        Valencia
                                    </p>
                                </div>
                                <div>
                                    <span className="label-mono">Mercado</span>
                                    <p
                                        className="mt-1 text-[20px] text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                    >
                                        Europa
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── §02 · Story ────────────────────────── */}
            <section className="relative bg-[var(--color-paper)] py-24 lg:py-32">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 mb-14 border-t border-[var(--color-ink)] pt-8">
                        <div className="lg:col-span-3">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §02
                            </span>
                            <p className="label-mono mt-2">Mision</p>
                        </div>
                        <div className="lg:col-span-6">
                            <h2
                                className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Que las velerias <span className="italic font-light">vendan online</span>, sin
                                infraestructura propia.
                            </h2>
                        </div>
                        <div className="lg:col-span-3 lg:pt-3">
                            <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                                Conocemos el sector desde dentro. Sabemos por que se pierden las ventas que ahora
                                rescatamos.
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                        className="grid lg:grid-cols-12 gap-10 lg:gap-14 border-t border-[var(--color-rule-strong)] pt-12"
                    >
                        <div className="lg:col-span-6 space-y-6 text-[16px] leading-[1.65] text-[var(--color-ink-2)]">
                            <p
                                className="text-[20px] lg:text-[22px] leading-[1.45] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Aerolume nace en Valencia, en el corazon del Mediterraneo, donde la vela no es solo un
                                deporte: es una forma de vida.
                            </p>
                            <p>
                                Hemos visto a velerias perder oportunidades porque sus clientes no tenian una forma
                                facil de configurar y presupuestar online. Llamadas, emails, hojas de calculo. Un
                                proceso que no ha cambiado en decadas.
                            </p>
                            <p>
                                Decidimos cambiarlo. Creamos una plataforma que permite a cualquier veleria ofrecer un
                                configurador premium en su propia web, con precios en tiempo real y presupuestos
                                automaticos.
                            </p>
                        </div>
                        <div className="lg:col-span-6 space-y-6 text-[16px] leading-[1.65] text-[var(--color-ink-2)]">
                            <p>
                                La base de datos de Aerolume cubre mas de 4 800 modelos de barco con medidas de aparejo
                                verificadas. Cuando un cliente busca su barco, el sistema ya sabe que areas de vela
                                necesita. Sin errores, sin dudas.
                            </p>
                            <p>
                                Nuestro objetivo es simple:{' '}
                                <span className="text-[var(--color-ink)] font-medium">
                                    que cada veleria venda mas con menos esfuerzo.
                                </span>{' '}
                                Un configurador 24/7, presupuestos automaticos y una imagen de marca al nivel que
                                merece.
                            </p>
                            <p>
                                Estamos en Valencia, pero trabajamos con velerias de toda Europa. Si vendes velas,
                                queremos ayudarte a vender mas.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── §03 · Tres principios ──────────────── */}
            <section className="relative bg-[var(--color-paper)] pb-24 lg:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 mb-16 lg:mb-20 border-t border-[var(--color-ink)] pt-8">
                        <div className="lg:col-span-3">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §03
                            </span>
                            <p className="label-mono mt-2">Lo que nos mueve</p>
                        </div>
                        <div className="lg:col-span-6">
                            <h2
                                className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Tres <span className="italic font-light">principios</span>.
                            </h2>
                        </div>
                        <div className="lg:col-span-3 lg:pt-3">
                            <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                                Lo que decidimos cuando dudamos. La brujula del producto.
                            </p>
                        </div>
                    </div>

                    <ul className="border-t border-[var(--color-ink)]">
                        {VALUES.map((p, i) => (
                            <motion.li
                                key={p.kicker}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                className="grid lg:grid-cols-12 gap-6 lg:gap-10 py-10 lg:py-14 border-b border-[var(--color-rule-strong)] group hover:bg-[var(--color-paper-2)]/40 transition-colors"
                            >
                                <div className="lg:col-span-2 flex lg:flex-col items-baseline lg:items-start gap-3">
                                    <span
                                        className="text-[3.5rem] lg:text-[5rem] leading-[0.85] text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors"
                                        style={{
                                            fontFamily: 'var(--font-fraunces), Georgia, serif',
                                            fontFeatureSettings: '"tnum"',
                                        }}
                                    >
                                        {p.num}
                                    </span>
                                    <span className="label-mono">{p.kicker}</span>
                                </div>

                                <div className="lg:col-span-6">
                                    <h3
                                        className="text-[1.5rem] lg:text-[2rem] leading-[1.1] tracking-[-0.015em] text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                    >
                                        {p.title}
                                    </h3>
                                    <p className="mt-4 text-[15px] leading-[1.65] text-[var(--color-ink-2)] max-w-[52ch]">
                                        {p.body}
                                    </p>
                                </div>

                                <div className="lg:col-span-4 lg:border-l lg:border-[var(--color-rule)] lg:pl-8">
                                    <span className="label-mono mb-3 block">Senales</span>
                                    <ul className="space-y-2">
                                        {p.spec.map((s) => (
                                            <li
                                                key={s}
                                                className="flex items-baseline gap-3 font-mono text-[12px] text-[var(--color-ink-2)]"
                                            >
                                                <span className="block h-px w-3 bg-[var(--color-ink-3)] translate-y-[-3px]" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── §04 · Cifras ───────────────────────── */}
            <section className="relative bg-[var(--color-paper)] pb-24 lg:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 mb-12 border-t border-[var(--color-ink)] pt-8">
                        <div className="lg:col-span-3">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §04
                            </span>
                            <p className="label-mono mt-2">Cifras</p>
                        </div>
                        <div className="lg:col-span-6">
                            <h2
                                className="text-[2rem] sm:text-[2.5rem] lg:text-[3rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Donde estamos <span className="italic font-light">hoy.</span>
                            </h2>
                        </div>
                        <div className="lg:col-span-3 lg:pt-3">
                            <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                                Datos reales del producto y del equipo. Sin maquillar, sin extrapolar.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 border-t-2 border-[var(--color-ink)]">
                        {METRICS.map((m, i) => (
                            <motion.div
                                key={m.ref}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className={`p-6 lg:p-8 border-b border-[var(--color-rule)] ${
                                    i % 2 === 1 ? '' : 'lg:border-r'
                                } ${i < 2 ? 'lg:border-r' : ''} ${i < 3 ? 'lg:border-r' : ''} border-[var(--color-rule)]`}
                            >
                                <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-ink-3)]">
                                    {m.ref}
                                </span>
                                <p
                                    className="mt-4 text-[2.5rem] lg:text-[3.25rem] leading-[0.95] text-[var(--color-ink)]"
                                    style={{
                                        fontFamily: 'var(--font-fraunces), Georgia, serif',
                                        fontFeatureSettings: '"tnum"',
                                    }}
                                >
                                    {m.metric}
                                </p>
                                <p className="mt-3 text-[13px] leading-[1.5] text-[var(--color-ink-2)] max-w-[24ch]">
                                    {m.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <p className="mt-6 font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
                        † Datos al cierre del Q1 2026.
                    </p>
                </div>
            </section>

            {/* ── §05 · Final CTA ────────────────────── */}
            <section className="relative bg-[var(--color-ink)] text-[var(--color-paper)] py-24 lg:py-32 overflow-hidden">
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
                    <div className="grid lg:grid-cols-12 gap-10 items-end border-t border-[var(--color-paper)]/30 pt-8">
                        <div className="lg:col-span-3">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §05
                            </span>
                            <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-paper)]/55 mt-2">
                                Hablemos
                            </p>
                        </div>
                        <div className="lg:col-span-9">
                            <motion.h2
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                                className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.75rem] leading-[1] tracking-[-0.025em] text-[var(--color-paper)]"
                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                            >
                                Quieres ver Aerolume
                                <br />
                                <span className="italic font-light text-[var(--color-paper)]/85">
                                    en accion?
                                </span>
                            </motion.h2>
                        </div>
                    </div>

                    <div className="mt-14 lg:mt-20 grid lg:grid-cols-12 gap-10 items-end">
                        <div className="lg:col-span-7 lg:col-start-4">
                            <p className="text-[16px] lg:text-[18px] leading-[1.55] text-[var(--color-paper)]/65 max-w-[44ch]">
                                Te ensenamos el configurador personalizado para tu marca, con tus productos, en menos
                                de 30 minutos.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                                <Link
                                    href="/contact"
                                    className="group inline-flex items-center gap-3 bg-[var(--color-paper)] text-[var(--color-ink)] pl-5 pr-4 py-3.5 text-[13px] tracking-[0.02em] font-medium hover:bg-[var(--color-signal)] hover:text-[var(--color-paper)] transition-colors"
                                >
                                    Contactar
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="text-[13px] tracking-[0.02em] text-[var(--color-paper)] border-b border-[var(--color-paper)]/40 pb-1 hover:border-[var(--color-paper)] transition-colors"
                                >
                                    Ver planes
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-t border-[var(--color-paper)]/15 pt-6">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-paper)]/45">
                            <span>Valencia · 39° 28&apos; N</span>
                            <span className="block h-px w-3 bg-[var(--color-paper)]/25" />
                            <span>Atendemos Europa</span>
                            <span className="block h-px w-3 bg-[var(--color-paper)]/25" />
                            <span>Demo en 30 min</span>
                        </div>
                        <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-[var(--color-paper)]/45">
                            §05 · Aerolume / Edicion 04
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
