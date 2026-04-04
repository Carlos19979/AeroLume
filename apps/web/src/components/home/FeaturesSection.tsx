'use client';

import { motion } from 'framer-motion';
import { Search, Gauge, Compass, Sparkles, Layers, Zap } from 'lucide-react';

const FEATURES = [
    {
        icon: Search,
        title: 'Busqueda inteligente',
        description: 'Escribe un nombre. El sistema encuentra tu barco entre miles, con correccion difusa y autocompletado en tiempo real.',
    },
    {
        icon: Gauge,
        title: 'Geometria del aparejo',
        description: 'P, E, I, J — las cotas que definen tus velas. Precargadas, verificadas, listas para usar.',
    },
    {
        icon: Layers,
        title: 'Mayor, proa y portantes',
        description: 'Cada grupo de vela se configura por separado con su propia superficie, tejido y opciones.',
    },
    {
        icon: Sparkles,
        title: 'Guiado o a tu manera',
        description: 'El modo guiado precarga todo. El modo experto te deja ajustar cada parametro a mano.',
    },
    {
        icon: Compass,
        title: 'Catalogo real',
        description: 'Las propuestas que ves existen. Precios actuales, fichas completas, configuracion detallada.',
    },
    {
        icon: Zap,
        title: 'Un enlace, toda la config',
        description: 'Cada seleccion se codifica en la URL. Comparte tu configuracion exacta con un copy-paste.',
    },
];

export function FeaturesSection() {
    return (
        <section className="relative py-32 overflow-hidden bg-[var(--color-surface)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(11,95,170,0.03),transparent_70%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl"
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
                        Lo que hay dentro
                    </p>
                    <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.92] text-[var(--color-text)]">
                        Herramientas que no sobran.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)]">
                        Cada funcionalidad resuelve un problema concreto. Ni mas, ni menos.
                    </p>
                </motion.div>

                <div className="mt-12 glow-line opacity-20" />

                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.article
                                key={feature.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="group relative bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(10,37,64,0.04),0_8px_32px_rgba(10,37,64,0.04)] transition-all duration-500 hover:shadow-[0_4px_12px_rgba(10,37,64,0.06),0_20px_48px_rgba(11,95,170,0.1)] hover:-translate-y-1"
                            >
                                {/* Top accent line */}
                                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/0 to-transparent group-hover:via-[var(--color-accent)]/40 transition-all duration-500" />

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/[0.07]">
                                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                                </div>

                                <h3 className="mt-6 font-[var(--font-display)] text-[1.4rem] text-[var(--color-text)]">
                                    {feature.title}
                                </h3>

                                <p className="mt-3 text-sm leading-[1.7] text-[var(--color-text-secondary)]">
                                    {feature.description}
                                </p>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
