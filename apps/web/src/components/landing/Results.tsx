'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, ShieldCheck } from 'lucide-react';

const METRICS = [
  {
    icon: TrendingUp,
    value: '+40%',
    label: 'Mas solicitudes de presupuesto',
    description: 'Los clientes configuran y solicitan desde tu web, sin llamadas ni emails.',
  },
  {
    icon: Clock,
    value: '75%',
    label: 'Menos tiempo en presupuestos',
    description: 'El configurador automatiza el proceso. Tu solo revisas y envias.',
  },
  {
    icon: Users,
    value: '24/7',
    label: 'Disponible siempre',
    description: 'Tu configurador trabaja mientras duermes. Los clientes configuran cuando quieren.',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Datos verificados',
    description: 'Base de datos con medidas de aparejo verificadas para mas de 4.800 barcos.',
  },
];

export function Results() {
  return (
    <section className="py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #0a2540 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#0b5faa] font-semibold mb-4">Resultados</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0a2540] leading-[1.1] font-[family-name:var(--font-cormorant)]">
            Lo que consigues con Aerolume
          </h2>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">
            Un configurador que trabaja por ti. Menos tiempo, mas ventas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0b5faa]/8 flex items-center justify-center mx-auto mb-5">
                  <Icon size={22} className="text-[#0b5faa]" />
                </div>
                <p className="text-3xl font-bold text-[#0a2540] font-[family-name:var(--font-cormorant)]">{metric.value}</p>
                <p className="text-sm font-semibold text-[#0a2540] mt-2">{metric.label}</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{metric.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
