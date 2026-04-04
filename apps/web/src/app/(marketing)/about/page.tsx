'use client';

import { motion } from 'framer-motion';
import { Anchor, Target, Lightbulb, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const VALUES = [
    {
        icon: Target,
        title: 'Precision',
        body: 'Cada medida del aparejo esta verificada. Mas de 4.800 modelos con datos reales. Sin aproximaciones.',
    },
    {
        icon: Lightbulb,
        title: 'Simplicidad',
        body: 'La configuracion de velas es compleja. Nosotros la convertimos en un flujo visual e intuitivo que cualquier cliente puede seguir.',
    },
    {
        icon: Users,
        title: 'Conversion',
        body: 'Cada visitante de tu web es una oportunidad. El configurador la convierte en un presupuesto real, sin fricciones.',
    },
];

export default function AboutPage() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-white">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #0a2540 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#0b5faa] font-semibold">Nosotros</p>
                    <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-[#0a2540] font-[family-name:var(--font-cormorant)]">
                        Tecnologia nautica
                        <br />
                        <span className="italic" style={{ color: '#0b5faa' }}>
                            desde Valencia
                        </span>
                    </h1>
                </motion.div>

                {/* Story */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="mt-12 grid lg:grid-cols-2 gap-12"
                >
                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <p className="text-lg">
                            Aerolume nace en Valencia, en el corazon del Mediterraneo, donde la vela no es solo un deporte — es una forma de vida.
                        </p>
                        <p>
                            Conocemos el sector nautico desde dentro. Hemos visto como los proveedores de velas pierden oportunidades de venta porque sus clientes no tienen una forma facil de configurar y presupuestar online. Llamadas, emails, hojas de calculo — un proceso que no ha cambiado en decadas.
                        </p>
                        <p>
                            Decidimos cambiarlo. Creamos una plataforma que permite a cualquier proveedor de velas ofrecer a sus clientes un configurador premium, integrado en su propia web, con precios en tiempo real y presupuestos automaticos.
                        </p>
                    </div>
                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <p>
                            La base de datos de Aerolume cubre mas de 4.800 modelos de barcos con medidas de aparejo verificadas. Cuando un cliente busca su barco, el sistema ya sabe que areas de vela necesita. Sin errores, sin dudas.
                        </p>
                        <p>
                            Nuestro objetivo es simple: <span className="text-[#0a2540] font-semibold">que cada proveedor de velas venda mas, con menos esfuerzo.</span> Un configurador que trabaja 24/7, genera presupuestos automaticamente y eleva la imagen de tu negocio al nivel que merece.
                        </p>
                        <p>
                            Estamos en Valencia, pero trabajamos con proveedores de toda Europa. Si vendes velas, queremos ayudarte a vender mas.
                        </p>
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="mt-20 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#0b5faa] font-semibold mb-4">Lo que nos mueve</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#0a2540] font-[family-name:var(--font-cormorant)]">
                        Tres principios
                    </h2>
                </motion.div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {VALUES.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.article
                                key={item.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group rounded-3xl border border-gray-100 p-8 transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#0b5faa]/8 flex items-center justify-center mb-5">
                                    <Icon size={22} className="text-[#0b5faa]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0a2540] mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                            </motion.article>
                        );
                    })}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-24 rounded-3xl overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, #0a2540, #0d3158)' }}
                >
                    {/* Texture */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    <div className="relative p-10 md:p-14">
                        <div className="flex items-center gap-3 mb-6">
                            <Anchor size={20} className="text-white/40" />
                            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">Desde Valencia para toda Europa</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-cormorant)] leading-[1.15]">
                            ¿Quieres saber como Aerolume
                            <br />
                            puede ayudar a tu negocio?
                        </h2>
                        <p className="mt-4 text-white/40 max-w-lg leading-relaxed">
                            Contacta con nosotros y te enseñamos el configurador en accion, personalizado para tu marca.
                        </p>
                        <Link
                            href="/contact"
                            className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-[#0a2540] transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
                        >
                            Contactar
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
