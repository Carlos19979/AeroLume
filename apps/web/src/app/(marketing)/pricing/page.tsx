'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const TRIAL_FEATURES = [
    'Acceso completo durante 7 días',
    'Configurador de velas embebible',
    'Hasta 20 productos',
    'Generación de presupuestos PDF',
    'Soporte por email',
];

const PRO_FEATURES = [
    'Todo lo del periodo de prueba',
    'Productos ilimitados',
    'Analytics de configuraciones',
    'Webhooks personalizables',
    'Acceso a API REST',
    'Soporte prioritario',
    'Sin permanencia — cancela cuando quieras',
];

const FAQS = [
    {
        q: '¿Qué pasa cuando termina el periodo de prueba?',
        a: 'Puedes suscribirte al plan Pro para seguir usando Aerolume sin interrupciones. Si no te suscribes, tu cuenta queda pausada y tus datos se conservan durante 30 días.',
    },
    {
        q: '¿Hay permanencia o penalización por cancelar?',
        a: 'Ninguna. El plan Pro es mensual y puedes cancelarlo en cualquier momento desde el panel. Sin letra pequeña.',
    },
    {
        q: '¿Los 300 EUR/mes incluyen IVA?',
        a: 'No. El precio indicado es sin IVA. El IVA aplicable depende del país de facturación de tu empresa.',
    },
    {
        q: '¿Puedo cambiar de plan más adelante?',
        a: 'Sí. Empieza con la prueba gratuita y suscríbete cuando estés listo. No hay planes intermedios ni costes ocultos.',
    },
];

export default function PricingPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="pt-32 pb-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h1
                        data-testid="pricing-hero-heading"
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0a2540] leading-[1.1] font-[family-name:var(--font-cormorant)]"
                    >
                        Planes simples,
                        <br />
                        <span className="italic text-[#0b5faa]">sin sorpresas</span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Prueba gratis durante 7 días con acceso completo. Cuando estés listo, un único plan Pro sin letra pequeña.
                    </p>
                </motion.div>
            </section>

            {/* Pricing cards */}
            <section className="pb-24 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Trial card */}
                    <motion.div
                        data-testid="pricing-tier-trial"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-2xl border border-gray-200 p-8 bg-white"
                    >
                        <div className="mb-6">
                            <p className="text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase mb-3">Prueba gratuita</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-[#0a2540] font-[family-name:var(--font-cormorant)]">0 €</span>
                                <span className="text-gray-400 text-sm">/ 7 días</span>
                            </div>
                            <p className="mt-3 text-sm text-gray-500">
                                Acceso completo sin tarjeta de crédito.
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {TRIAL_FEATURES.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                                    <Check size={16} className="mt-0.5 shrink-0 text-[#0b5faa]" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link
                            data-testid="pricing-cta-trial"
                            href="/signup"
                            className="block w-full text-center px-6 py-3 rounded-xl border-2 border-[#0a2540] text-[#0a2540] text-sm font-semibold transition-all duration-300 hover:bg-[#0a2540] hover:text-white"
                        >
                            Empezar gratis
                        </Link>
                    </motion.div>

                    {/* Pro card */}
                    <motion.div
                        data-testid="pricing-tier-pro"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative rounded-2xl border-2 border-[#0b5faa] p-8 bg-[#0a2540] shadow-[0_20px_60px_rgba(10,37,64,0.18)]"
                    >
                        {/* Badge */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="inline-flex px-4 py-1 rounded-full bg-[#0b5faa] text-white text-xs font-semibold tracking-wide">
                                Recomendado
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold tracking-[0.12em] text-white/40 uppercase mb-3">Pro</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-white font-[family-name:var(--font-cormorant)]">300 €</span>
                                <span className="text-white/40 text-sm">/ mes</span>
                            </div>
                            <p className="mt-3 text-sm text-white/50">
                                Sin permanencia. Cancela cuando quieras.
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {PRO_FEATURES.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                                    <Check size={16} className="mt-0.5 shrink-0 text-[#7dd3fc]" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link
                            data-testid="pricing-cta-pro"
                            href="/signup"
                            className="group flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-xl bg-white text-[#0a2540] text-sm font-semibold transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
                        >
                            Suscribirse
                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 border-t border-gray-100 bg-gray-50/60">
                <div className="max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold text-[#0a2540] mb-10 font-[family-name:var(--font-cormorant)]"
                    >
                        Preguntas frecuentes
                    </motion.h2>
                    <div className="space-y-6">
                        {FAQS.map((faq, i) => (
                            <motion.div
                                key={faq.q}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                className="border-b border-gray-200 pb-6 last:border-0"
                            >
                                <p className="text-sm font-semibold text-[#0a2540] mb-2">{faq.q}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom reassurance strip */}
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-3 text-xs text-gray-400 tracking-wide">
                    <span>Sin tarjeta de crédito en la prueba</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 self-center hidden sm:block" />
                    <span>Setup en menos de 48h</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 self-center hidden sm:block" />
                    <span>Cancelación inmediata</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 self-center hidden sm:block" />
                    <span>Soporte por email incluido</span>
                </div>
            </section>
        </div>
    );
}
