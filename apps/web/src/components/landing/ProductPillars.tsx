'use client';

import { motion } from 'framer-motion';
import { Code, LayoutDashboard, Plug, ArrowUpRight } from 'lucide-react';

const PILLARS = [
  {
    num: '01',
    icon: Code,
    title: 'Widget embebible',
    description: 'Un configurador white-label que se integra en tu web con 3 lineas de codigo. Busqueda de barcos, seleccion de velas, precios en tiempo real.',
    accent: '#3b82f6',
    gradient: 'from-blue-500/10 to-blue-500/0',
  },
  {
    num: '02',
    icon: LayoutDashboard,
    title: 'Dashboard de gestion',
    description: 'Productos, presupuestos, analytics y personalizacion desde un solo panel. Todo lo que necesitas para gestionar tus ventas.',
    accent: '#10b981',
    gradient: 'from-emerald-500/10 to-emerald-500/0',
  },
  {
    num: '03',
    icon: Plug,
    title: 'API REST',
    description: 'Integra los datos de barcos y productos en tu sistema existente. Documentacion completa, API keys, webhooks.',
    accent: '#8b5cf6',
    gradient: 'from-violet-500/10 to-violet-500/0',
  },
];

export function ProductPillars() {
  return (
    <section id="producto" className="py-28 bg-white relative overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #0a2540 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-20"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#0b5faa] font-semibold mb-4">La plataforma</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0a2540] leading-[1.1] font-[family-name:var(--font-cormorant)]">
            Todo lo que necesitas para vender velas online
          </h2>
          <p className="mt-5 text-lg text-gray-500 leading-relaxed">
            Tres herramientas. Un objetivo: que vendas mas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-3xl border border-gray-200/60 p-8 pb-10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.04] hover:-translate-y-1 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  {/* Number */}
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase mb-6 block" style={{ color: pillar.accent }}>{pillar.num}</span>

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${pillar.accent}10`, border: `1px solid ${pillar.accent}15` }}
                  >
                    <Icon size={24} style={{ color: pillar.accent }} />
                  </div>

                  <h3 className="text-xl font-bold text-[#0a2540] mb-3 flex items-center gap-2">
                    {pillar.title}
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: pillar.accent }} />
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
