'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-react';

const STEPS = [
    {
        number: '01',
        icon: Search,
        title: 'Busca tu barco',
        description: 'Escribe el modelo. La base de datos carga automaticamente eslora, cotas del aparejo y superficies de referencia.',
    },
    {
        number: '02',
        icon: SlidersHorizontal,
        title: 'Configura cada vela',
        description: 'Elige entre mayor, proa y portantes. Compara cortes, tejidos y opciones. Ajusta en modo experto si lo necesitas.',
    },
    {
        number: '03',
        icon: ShoppingCart,
        title: 'Compara y decide',
        description: 'Revisa productos reales con precios, fichas tecnicas y configuracion detallada. Todo sin salir del flujo.',
    },
];

export function ProcessSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 0.8', 'end 0.5'],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    return (
        <section ref={sectionRef} className="relative py-32 overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_50%,rgba(11,95,170,0.04),transparent_60%)]" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Como funciona</p>
                    <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.92] text-[var(--color-text)]">
                        Tres pasos. Cero friccion.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)]">
                        De saber que barco tienes a tener la vela configurada. Sin llamadas, sin hojas de calculo.
                    </p>
                </motion.div>

                <div className="mt-20 relative">
                    {/* Animated vertical line */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-[var(--color-border)] hidden lg:block">
                        <motion.div
                            className="w-full bg-[var(--color-accent)] origin-top"
                            style={{ height: lineHeight }}
                        />
                    </div>

                    <div className="space-y-16 lg:space-y-24">
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: '-80px' }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="relative lg:pl-24"
                                >
                                    {/* Dot on line */}
                                    <div className="absolute left-[26px] top-2 hidden lg:flex h-5 w-5 items-center justify-center">
                                        <div className="h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_rgba(11,95,170,0.4)]" />
                                    </div>

                                    <div className="group relative rounded-2xl bg-white p-7 shadow-[0_1px_3px_rgba(10,37,64,0.04),0_8px_32px_rgba(10,37,64,0.04)] transition-all duration-500 hover:shadow-[0_4px_12px_rgba(10,37,64,0.06),0_20px_48px_rgba(11,95,170,0.1)] hover:-translate-y-1">
                                        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/0 to-transparent group-hover:via-[var(--color-accent)]/40 transition-all duration-500" />
                                        <div className="flex items-start gap-5">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/[0.07]">
                                                <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                                            </div>
                                            <div>
                                                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                                                    Paso {step.number}
                                                </div>
                                                <h3 className="mt-2 font-[var(--font-display)] text-2xl text-[var(--color-text)] md:text-3xl">
                                                    {step.title}
                                                </h3>
                                                <p className="mt-3 max-w-lg text-sm leading-[1.7] text-[var(--color-text-secondary)]">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
