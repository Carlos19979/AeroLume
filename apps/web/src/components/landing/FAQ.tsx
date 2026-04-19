'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const QUESTIONS = [
    {
        q: 'Como se integra el widget?',
        a: 'Tres lineas de HTML en tu web. El widget se adapta al ancho del contenedor y respeta colores y fuentes que configures en el dashboard.',
    },
    {
        q: 'Puedo personalizar colores y logo?',
        a: 'Si. Color principal, secundarios, fuente y logo se configuran desde el dashboard. El widget se mimetiza con la identidad de tu marca.',
    },
    {
        q: 'Que barcos incluye?',
        a: '4 839 modelos con medidas de aparejo verificadas (P, E, I, J, eslora). Si falta alguno, lo añadimos en menos de 24 horas.',
    },
    {
        q: 'Hay compromiso de permanencia?',
        a: 'No. Cancelas cuando quieras, sin penalizaciones. El setup inicial cubre la configuracion de tu cuenta y onboarding.',
    },
    {
        q: 'Como funciona el soporte?',
        a: 'Email y chat, respuesta en menos de 24h en dias laborables. El plan Enterprise incluye soporte prioritario y gestor de cuenta.',
    },
    {
        q: 'Puedo añadir mis propios barcos?',
        a: 'Si. Desde el dashboard gestionas barcos personalizados que solo veran tus clientes, ademas de toda la base global.',
    },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[var(--color-rule)]">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls={`faq-answer-${index}`}
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
                    className={`text-[var(--color-ink)] shrink-0 mt-1 transition-transform duration-300 ${
                        open ? 'rotate-45' : ''
                    }`}
                />
            </button>
            <div
                id={`faq-answer-${index}`}
                role="region"
                aria-hidden={!open}
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open ? '300px' : '0', opacity: open ? 1 : 0 }}
            >
                <div className="pb-6 pl-[72px] pr-8 max-w-[60ch]">
                    <p className="text-[14.5px] leading-[1.6] text-[var(--color-ink-2)]">{a}</p>
                </div>
            </div>
        </div>
    );
}

export function FAQ() {
    return (
        <section className="relative bg-[var(--color-paper)] py-24 lg:py-32">
            <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
                <div className="grid lg:grid-cols-12 gap-10 mb-12 border-t border-[var(--color-ink)] pt-8">
                    <div className="lg:col-span-4">
                        <span className="font-mono text-[12px] tracking-[0.18em] text-[var(--color-signal)] font-medium">
                            §06
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
                        {QUESTIONS.map((item, index) => (
                            <FAQItem key={item.q} q={item.q} a={item.a} index={index} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
