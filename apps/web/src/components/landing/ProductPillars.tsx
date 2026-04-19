'use client';

import { motion } from 'framer-motion';

const PILLARS = [
    {
        num: '01',
        kicker: 'Front-end',
        title: 'Widget embebible',
        body: 'Un configurador white-label en la web del retailer. Tres lineas de codigo, tres pasos para el cliente: barco, vela, presupuesto.',
        spec: ['<script src> 3.4 KB', 'iframe sandbox', 'Postmessage events'],
    },
    {
        num: '02',
        kicker: 'Back-office',
        title: 'Dashboard',
        body: 'Productos, precios, presupuestos, analítica y branding desde un solo panel. Sin Excel, sin emails sueltos.',
        spec: ['Margen automático', 'Webhook outbound', 'Multi-usuario'],
    },
    {
        num: '03',
        kicker: 'Integracion',
        title: 'API REST',
        body: 'Conecta los datos de barcos y configuraciones a tu ERP, CRM o tienda. API keys, webhooks firmados, logs.',
        spec: ['Auth: x-api-key', 'CORS por dominio', 'OpenAPI 3.1'],
    },
];

export function ProductPillars() {
    return (
        <section id="producto" className="relative bg-[var(--color-paper)] py-24 lg:py-32">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                {/* Section header — runs as a column header, not centered */}
                <div className="grid lg:grid-cols-12 gap-10 mb-16 lg:mb-20 border-t border-[var(--color-ink)] pt-8">
                    <div className="lg:col-span-3">
                        <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                            §02
                        </span>
                        <p className="label-mono mt-2">La plataforma</p>
                    </div>
                    <div className="lg:col-span-6">
                        <h2
                            className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                        >
                            Tres piezas. Una <span className="italic font-light">caja de herramientas</span> para vender velas online.
                        </h2>
                    </div>
                    <div className="lg:col-span-3 lg:pt-3">
                        <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                            Pensado para velerias, no para developers. Lo instalas en horas, no en sprints.
                        </p>
                    </div>
                </div>

                {/* Pillars as a list, not as cards. Heavy hairline rules separate them. */}
                <ul className="border-t border-[var(--color-ink)]">
                    {PILLARS.map((p, i) => (
                        <motion.li
                            key={p.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="grid lg:grid-cols-12 gap-6 lg:gap-10 py-10 lg:py-14 border-b border-[var(--color-rule-strong)] group hover:bg-[var(--color-paper-2)]/40 transition-colors"
                        >
                            <div className="lg:col-span-2 flex lg:flex-col items-baseline lg:items-start gap-3">
                                <span
                                    className="text-[3.5rem] lg:text-[5rem] leading-[0.85] text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors"
                                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"tnum"' }}
                                >
                                    {p.num}
                                </span>
                                <span className="label-mono">{p.kicker}</span>
                            </div>

                            <div className="lg:col-span-6">
                                <h3
                                    className="text-[1.75rem] lg:text-[2.25rem] leading-[1.05] tracking-[-0.015em] text-[var(--color-ink)]"
                                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                >
                                    {p.title}
                                </h3>
                                <p className="mt-4 text-[15px] leading-[1.65] text-[var(--color-ink-2)] max-w-[52ch]">
                                    {p.body}
                                </p>
                            </div>

                            <div className="lg:col-span-4 lg:border-l lg:border-[var(--color-rule)] lg:pl-8">
                                <span className="label-mono mb-3 block">Especificacion</span>
                                <ul className="space-y-2">
                                    {p.spec.map((s) => (
                                        <li key={s} className="flex items-baseline gap-3 font-mono text-[12px] text-[var(--color-ink-2)]">
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
    );
}
