'use client';

import { motion } from 'framer-motion';
import { Compass, Waves, Zap } from 'lucide-react';
import Link from 'next/link';

const VALUES = [
    {
        icon: Compass,
        title: 'Precision tecnica',
        body: 'Cada medida del aparejo esta verificada contra una base de datos con mas de 4.000 modelos de barcos.',
    },
    {
        icon: Waves,
        title: 'Claridad sobre complejidad',
        body: 'La configuracion de velas puede ser confusa. Mostramos lo necesario, con contexto, sin ruido.',
    },
    {
        icon: Zap,
        title: 'Resultados reales',
        body: 'No simulamos nada. Las propuestas que ves son productos comerciales con precios y fichas tecnicas.',
    },
];

export default function AboutPage() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_0%,rgba(11,95,170,0.05),transparent_60%)]" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">Nosotros</div>
                    <h1 className="mt-4 font-[var(--font-display)] text-[clamp(3rem,6vw,5.5rem)] font-light leading-[0.9] text-[var(--color-text)]">
                        Navegar mejor empieza por
                        <br />
                        <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dim)] bg-clip-text text-transparent">
                            elegir mejor.
                        </span>
                    </h1>
                    <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
                        Aerolume nace de una idea simple: que configurar las velas de tu barco
                        no deberia requerir ni hojas de calculo ni llamadas interminables.
                        Un flujo tecnico, visual y directo.
                    </p>
                </motion.div>

                <div className="mt-16 glow-line opacity-20" />

                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {VALUES.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.article
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="group relative bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(10,37,64,0.04),0_8px_32px_rgba(10,37,64,0.04)] transition-all duration-500 hover:shadow-[0_4px_12px_rgba(10,37,64,0.06),0_20px_48px_rgba(11,95,170,0.1)] hover:-translate-y-1"
                            >
                                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/0 to-transparent group-hover:via-[var(--color-accent)]/40 transition-all duration-500" />

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/[0.07]">
                                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                                </div>
                                <h3 className="mt-6 font-[var(--font-display)] text-[1.4rem] text-[var(--color-text)]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-[1.7] text-[var(--color-text-secondary)]">
                                    {item.body}
                                </p>
                            </motion.article>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-24 rounded-2xl bg-[var(--color-navy)] p-8 md:p-12"
                >
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Vision</div>
                    <h2 className="mt-4 font-[var(--font-display)] text-3xl font-light text-white md:text-4xl">
                        Herramientas que respetan tu tiempo.
                    </h2>
                    <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/60">
                        Creemos que la tecnologia debe simplificar decisiones, no complicarlas.
                        Aerolume reduce la friccion entre saber que barco tienes y encontrar
                        la vela que necesitas — con datos verificados, productos reales y
                        un flujo que se completa en minutos.
                    </p>
                    <Link
                        href="/configurator"
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-navy)] transition-all hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)]"
                    >
                        Probar el configurador
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
