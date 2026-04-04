'use client';

import { motion } from 'framer-motion';
import { Code2, Palette, Rocket } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: Palette,
    title: 'Configuramos tu cuenta',
    description: 'Creamos tu espacio con tus productos, precios y marca. Personalizamos colores, fuentes y logo para que el widget sea 100% tuyo.',
    detail: 'Setup en 48 horas',
    color: '#3b82f6',
  },
  {
    num: '02',
    icon: Code2,
    title: 'Integras el widget',
    description: 'Copias 3 lineas de codigo en tu web. El configurador aparece donde tu quieras, adaptado al ancho de tu pagina.',
    detail: '3 lineas de codigo',
    color: '#10b981',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Empiezas a vender',
    description: 'Tus clientes buscan su barco, configuran la vela y solicitan presupuesto. Tu recibes cada solicitud en el dashboard y por webhook.',
    detail: 'Presupuestos automaticos',
    color: '#f59e0b',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #040e1a, #0a2540, #0d3158)' }}>
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-20"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-semibold mb-4">Como funciona</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] font-[family-name:var(--font-cormorant)]">
            Tres pasos para empezar a vender
          </h2>
          <p className="mt-5 text-lg text-white/40 leading-relaxed">
            De la idea a tener tu configurador funcionando en menos de 48 horas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-3xl border border-white/[0.06] p-8 pb-10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-500"
              >
                {/* Number */}
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase mb-6 block" style={{ color: step.color }}>{step.num}</span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}20` }}
                >
                  <Icon size={24} style={{ color: step.color }} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-4">{step.description}</p>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${step.color}15`, color: step.color }}>
                  {step.detail}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
