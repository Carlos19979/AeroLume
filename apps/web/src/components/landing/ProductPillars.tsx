'use client';

import { motion } from 'framer-motion';
import { Code, LayoutDashboard, Plug } from 'lucide-react';

const PILLARS = [
  {
    icon: Code,
    title: 'Widget embebible',
    description: 'Un configurador white-label que se integra en tu web con 3 lineas de codigo. Busqueda de barcos, seleccion de velas, precios en tiempo real.',
    color: '59, 130, 246',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard de gestion',
    description: 'Productos, presupuestos, analytics y personalizacion desde un solo panel. Todo lo que necesitas para gestionar tus ventas.',
    color: '16, 185, 129',
  },
  {
    icon: Plug,
    title: 'API REST',
    description: 'Integra los datos de barcos y productos en tu sistema existente. Documentacion completa, API keys, webhooks.',
    color: '168, 85, 247',
  },
];

export function ProductPillars() {
  return (
    <section id="producto" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[family-name:var(--font-cormorant)]">
            Todo lo que necesitas para vender velas online
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Tres herramientas. Un objetivo: que vendas mas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-3xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `rgba(${pillar.color}, 0.08)` }}
                >
                  <Icon size={24} style={{ color: `rgb(${pillar.color})` }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                {/* Subtle gradient on hover */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{ background: `linear-gradient(135deg, rgba(${pillar.color}, 0.03), transparent)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
