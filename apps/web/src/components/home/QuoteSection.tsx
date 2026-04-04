'use client';

import { motion } from 'framer-motion';

export function QuoteSection() {
    return (
        <section className="relative py-32 overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(11,95,170,0.03),transparent_60%)]" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
                <motion.blockquote
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    {/* Opening quote mark */}
                    <div className="mx-auto mb-8 font-[var(--font-display)] text-8xl leading-none text-[var(--color-accent)]/15">
                        &ldquo;
                    </div>

                    <p className="font-[var(--font-display)] text-[clamp(1.8rem,4vw,3.2rem)] font-light leading-[1.2] text-[var(--color-text)]">
                        La diferencia entre navegar y{' '}
                        <span className="italic text-[var(--color-accent)]">navegar bien</span>{' '}
                        es una vela que entiende tu barco.
                    </p>

                    <div className="mx-auto mt-10 h-px w-16 bg-[var(--color-accent)]/30" />

                    <footer className="mt-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                            Filosofia Aerolume
                        </p>
                    </footer>
                </motion.blockquote>
            </div>
        </section>
    );
}
