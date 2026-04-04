'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ChevronDown } from 'lucide-react';

const CONTACT_INFO = [
    { icon: Mail, label: 'Email', value: 'info@aerolume.com', href: 'mailto:info@aerolume.com' },
    { icon: Phone, label: 'Telefono', value: '+34 600 000 000', href: 'tel:+34600000000' },
    { icon: MapPin, label: 'Ubicacion', value: 'Barcelona, Espana', href: null },
];

const FAQ = [
    {
        q: 'Como funciona el configurador?',
        a: 'Buscas tu modelo de barco, el sistema precarga las dimensiones del aparejo y superficies de vela, y luego puedes comparar productos reales de diferentes fabricantes.',
    },
    {
        q: 'Los precios son orientativos?',
        a: 'Los precios provienen directamente de los catalogos de fabricantes. Son precios de referencia actualizados regularmente.',
    },
    {
        q: 'Puedo ajustar las medidas manualmente?',
        a: 'Si, activando el modo experto puedes modificar tanto la eslora como la superficie de cada tipo de vela.',
    },
];

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <section className="relative min-h-screen overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_0%,rgba(11,95,170,0.04),transparent_60%)]" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)]">Contacto</div>
                    <h1 className="mt-4 font-[var(--font-display)] text-[clamp(3rem,6vw,5rem)] font-light leading-[0.92] text-[var(--color-text)]">
                        Hablemos.
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
                        Tienes dudas sobre el configurador, necesitas soporte o quieres colaborar?
                        Escribe y respondemos lo antes posible.
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        onSubmit={(e) => e.preventDefault()}
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-9"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Nombre</label>
                                <input
                                    type="text"
                                    className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]/40"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Email</label>
                                <input
                                    type="email"
                                    className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]/40"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>
                        <div className="mt-5">
                            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Asunto</label>
                            <input
                                type="text"
                                className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]/40"
                                placeholder="Sobre que quieres hablar?"
                            />
                        </div>
                        <div className="mt-5">
                            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Mensaje</label>
                            <textarea
                                rows={5}
                                className="mt-2 w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]/40"
                                placeholder="Escribe tu mensaje..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-[var(--color-accent-dim)] hover:shadow-[0_8px_30px_rgba(11,95,170,0.25)]"
                        >
                            <Send className="h-4 w-4" />
                            Enviar mensaje
                        </button>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="space-y-8"
                    >
                        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                            <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Informacion</div>
                            <div className="mt-5 space-y-5">
                                {CONTACT_INFO.map((item) => {
                                    const Icon = item.icon;
                                    const Wrapper = item.href ? 'a' : 'div';
                                    return (
                                        <Wrapper
                                            key={item.label}
                                            {...(item.href ? { href: item.href } : {})}
                                            className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                                                <Icon className="h-4 w-4 text-[var(--color-accent)]" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{item.label}</div>
                                                <div className="mt-0.5 text-[var(--color-text)]">{item.value}</div>
                                            </div>
                                        </Wrapper>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                            <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Preguntas frecuentes</div>
                            <div className="mt-5 space-y-3">
                                {FAQ.map((item, i) => (
                                    <div key={i} className="rounded-lg border border-[var(--color-border)] bg-white">
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm text-[var(--color-text)]"
                                        >
                                            {item.q}
                                            <ChevronDown
                                                className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {openFaq === i && (
                                            <div className="border-t border-[var(--color-border)] px-4 py-3.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
