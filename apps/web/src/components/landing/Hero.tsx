'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Editorial náutico hero.
 *
 * The H1 must contain "configurador de velas" (locked by E2E test).
 * Primary CTA "Prueba el configurador" must link to /#configurador.
 *
 * Layout: Spec sheet on the left (display serif headline + mono metadata),
 * sail-plan technical drawing on the right. Paper background with chart grid.
 */
export function Hero() {
    return (
        <section className="relative overflow-hidden bg-[var(--color-paper)] pt-32 lg:pt-40 pb-20 lg:pb-28">
            {/* Faint chart grid behind everything */}
            <div className="absolute inset-0 bg-chart-grid opacity-60 pointer-events-none" aria-hidden="true" />
            {/* Vignette to fade the grid into paper */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 30%, transparent 30%, var(--color-paper) 100%)' }}
                aria-hidden="true"
            />

            <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
                {/* ── Top meta strip ────────────────────────────── */}
                <div className="flex items-center justify-between border-t border-b border-[var(--color-rule)] py-2.5 mb-12 lg:mb-16">
                    <span className="label-mono">Vol. I — N° 04</span>
                    <span className="label-mono hidden md:inline">SaaS para velerias</span>
                    <span className="label-mono">Abril MMXXVI</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    {/* ── LEFT: Headline + spec sheet ──────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:col-span-7"
                    >
                        {/* Section number */}
                        <div className="flex items-baseline gap-3 mb-7">
                            <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                                §01
                            </span>
                            <span className="h-px flex-1 max-w-[80px] bg-[var(--color-rule-strong)]" />
                            <span className="label-mono">Producto</span>
                        </div>

                        <h1
                            className="text-[3rem] sm:text-[4.25rem] lg:text-[5.75rem] font-light leading-[0.95] tracking-[-0.025em] text-[var(--color-ink)]"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"ss01"' }}
                        >
                            El configurador
                            <br />
                            de velas
                            <br />
                            <span
                                className="italic font-normal text-[var(--color-signal)]"
                                style={{ fontVariationSettings: '"opsz" 144' }}
                            >
                                que cierra
                            </span>{' '}
                            <span className="italic font-normal text-[var(--color-ink)]">la venta.</span>
                        </h1>

                        <p className="mt-10 max-w-[36ch] text-[17px] leading-[1.55] text-[var(--color-ink-2)]">
                            Un configurador embebible para velerias. Tus clientes eligen barco, configuran la vela, piden presupuesto. Tu cierras.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                            <Link
                                href="/#configurador"
                                className="group inline-flex items-center gap-3 bg-[var(--color-ink)] text-[var(--color-paper)] pl-5 pr-4 py-3.5 text-[13px] tracking-[0.02em] font-medium hover:bg-[var(--color-signal)] transition-colors"
                            >
                                Prueba el configurador
                                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="group inline-flex items-baseline gap-2 text-[13px] tracking-[0.02em] text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:text-[var(--color-signal)] hover:border-[var(--color-signal)] transition-colors"
                            >
                                Ver planes
                            </Link>
                        </div>

                        {/* Spec sheet */}
                        <div className="mt-16 grid grid-cols-3 gap-px bg-[var(--color-rule-strong)] border border-[var(--color-rule-strong)] max-w-[540px]">
                            {[
                                { k: 'Barcos', v: '4 839', sub: 'modelos verificados' },
                                { k: 'Tipos', v: '09', sub: 'mayor · genova · spi…' },
                                { k: 'Setup', v: '48h', sub: 'a configurador vivo' },
                            ].map((s) => (
                                <div key={s.k} className="bg-[var(--color-paper)] p-4">
                                    <div className="label-mono mb-2">{s.k}</div>
                                    <div
                                        className="text-[28px] leading-none text-[var(--color-ink)]"
                                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"tnum"' }}
                                    >
                                        {s.v}
                                    </div>
                                    <div className="mt-2 text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
                                        {s.sub}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── RIGHT: Sail plan technical drawing ──── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.1, delay: 0.15 }}
                        className="lg:col-span-5 hidden lg:block relative"
                    >
                        <SailPlan />
                    </motion.div>
                </div>
            </div>

            {/* Bottom hairline divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-rule)]" />
        </section>
    );
}

/**
 * Sail-plan technical drawing — pure SVG.
 * Riff on a classic sloop rig diagram with annotations.
 */
function SailPlan() {
    return (
        <figure className="relative">
            <div className="border border-[var(--color-rule-strong)] bg-[var(--color-paper)]/60 p-6">
                <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2 mb-3">
                    <span className="label-mono">Plano vélico — Bavaria 38</span>
                    <span className="label-mono">Esc. 1:120</span>
                </div>

                <svg viewBox="0 0 320 420" className="w-full h-auto" role="img" aria-label="Plano velico tecnico de un velero">
                    {/* Drawing colors via CSS custom props */}
                    <defs>
                        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="6" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.18" />
                        </pattern>
                    </defs>

                    {/* Waterline */}
                    <line x1="20" y1="380" x2="300" y2="380" stroke="#0d1f2d" strokeWidth="1" />
                    <line x1="20" y1="384" x2="300" y2="384" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" />

                    {/* Hull (simplified profile) */}
                    <path
                        d="M 50 380 Q 80 392 160 394 Q 240 392 270 380 L 268 372 Q 240 376 160 376 Q 80 376 52 372 Z"
                        fill="url(#hatch)"
                        stroke="#0d1f2d"
                        strokeWidth="1"
                    />

                    {/* Mast */}
                    <line x1="160" y1="376" x2="160" y2="40" stroke="#0d1f2d" strokeWidth="1.5" />
                    {/* Boom */}
                    <line x1="160" y1="320" x2="245" y2="320" stroke="#0d1f2d" strokeWidth="1.5" />
                    {/* Forestay */}
                    <line x1="160" y1="40" x2="245" y2="376" stroke="#0d1f2d" strokeWidth="0.8" />
                    {/* Backstay */}
                    <line x1="160" y1="40" x2="80" y2="376" stroke="#0d1f2d" strokeWidth="0.8" />

                    {/* Mainsail (filled triangle) */}
                    <path
                        d="M 162 50 L 162 318 L 242 318 Q 230 200 162 50 Z"
                        fill="#0d1f2d"
                        fillOpacity="0.06"
                        stroke="#0d1f2d"
                        strokeWidth="1"
                    />
                    {/* Mainsail battens */}
                    {[120, 180, 240, 290].map((y, i) => (
                        <line key={i} x1="163" y1={y} x2={232 - (290 - y) * 0.05} y2={y} stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" />
                    ))}

                    {/* Genoa (filled triangle) */}
                    <path
                        d="M 160 60 L 158 376 L 242 376 Q 220 200 160 60 Z"
                        fill="#c4452d"
                        fillOpacity="0.08"
                        stroke="#c4452d"
                        strokeWidth="1"
                    />

                    {/* Mast head detail */}
                    <circle cx="160" cy="40" r="3" fill="#0d1f2d" />
                    <circle cx="160" cy="40" r="6" fill="none" stroke="#0d1f2d" strokeWidth="0.5" />

                    {/* Annotation: P (mainsail luff) */}
                    <line x1="55" y1="50" x2="55" y2="318" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2" />
                    <line x1="50" y1="50" x2="60" y2="50" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" />
                    <line x1="50" y1="318" x2="60" y2="318" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" />
                    <text x="42" y="186" fontFamily="var(--font-mono), monospace" fontSize="9" fill="#0d1f2d" textAnchor="middle" transform="rotate(-90 42 186)">
                        P · 14.20 m
                    </text>

                    {/* Annotation: E (mainsail foot) */}
                    <line x1="160" y1="335" x2="245" y2="335" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2" />
                    <line x1="160" y1="330" x2="160" y2="340" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" />
                    <line x1="245" y1="330" x2="245" y2="340" stroke="#0d1f2d" strokeWidth="0.5" opacity="0.5" />
                    <text x="202" y="350" fontFamily="var(--font-mono), monospace" fontSize="9" fill="#0d1f2d" textAnchor="middle">
                        E · 4.65 m
                    </text>

                    {/* Annotation: I, J on right side */}
                    <text x="290" y="200" fontFamily="var(--font-mono), monospace" fontSize="9" fill="#c4452d" textAnchor="middle" transform="rotate(-90 290 200)">
                        I · 16.10 m
                    </text>
                </svg>

                <div className="mt-3 flex items-center justify-between border-t border-[var(--color-rule)] pt-2">
                    <span className="label-mono">Mayor · Génova · Spinaker</span>
                    <span className="label-mono">P / E / I / J / LP</span>
                </div>
            </div>

            {/* Floating annotation tag */}
            <div className="absolute -left-8 top-12 hidden xl:flex items-center gap-2 bg-[var(--color-paper)] border border-[var(--color-ink)] px-3 py-1.5">
                <span className="block h-2 w-2 bg-[var(--color-signal)]" />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-ink)]">
                    Datos verificados
                </span>
            </div>
        </figure>
    );
}
