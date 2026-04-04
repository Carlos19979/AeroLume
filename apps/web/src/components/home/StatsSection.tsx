'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
    { value: 4000, suffix: '+', label: 'Modelos en base de datos', prefix: '' },
    { value: 9, suffix: '', label: 'Tipos de vela configurables', prefix: '' },
    { value: 3, suffix: '', label: 'Grupos de velamen', prefix: '' },
    { value: 100, suffix: '%', label: 'Datos de aparejo verificados', prefix: '' },
];

function AnimatedNumber({ value, suffix, prefix, duration = 2 }: { value: number; suffix: string; prefix: string; duration?: number }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!inView) return;
        const start = performance.now();
        const step = (now: number) => {
            const elapsed = Math.min((now - start) / (duration * 1000), 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setDisplay(Math.round(eased * value));
            if (elapsed < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, value, duration]);

    return (
        <span ref={ref}>
            {prefix}{display.toLocaleString('es-ES')}{suffix}
        </span>
    );
}

export function StatsSection() {
    return (
        <section className="relative py-28 overflow-hidden bg-[var(--color-navy)]">
            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(11,95,170,0.15),transparent_70%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">En numeros</p>
                    <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] font-light text-white">
                        Precision que se mide.
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/8">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.03] p-8 lg:p-10 text-center backdrop-blur-sm"
                        >
                            <div className="font-[var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white leading-none">
                                <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                            </div>
                            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40 max-w-[16ch] mx-auto">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
