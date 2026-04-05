'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  'Widget white-label personalizable',
  'Dashboard completo de gestion',
  '4.839 barcos verificados',
  'API REST documentada',
  'Analytics en tiempo real',
  'Webhooks para integraciones',
  'Soporte tecnico por email',
  'Actualizaciones continuas',
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0a2540 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#0b5faa] font-semibold mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0a2540] font-[family-name:var(--font-cormorant)]">
            Un precio. Sin sorpresas.
          </h2>
          <p className="mt-4 text-lg text-gray-500">Todo incluido. Sin costes ocultos.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          {/* Card with glow */}
          <div className="relative">
            {/* Glow border effect */}
            <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br from-[#0b5faa]/30 via-transparent to-[#4da3ff]/20" />
            <div className="absolute -inset-4 rounded-[2.5rem] opacity-20 blur-2xl bg-gradient-to-br from-[#0b5faa] to-transparent" />

            <div className="relative rounded-[2rem] bg-white overflow-hidden shadow-2xl shadow-black/[0.06]">
              {/* Header */}
              <div className="relative p-10 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2540, #0d3158)' }}>
                {/* Subtle texture */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] text-white/60 font-medium mb-6">
                    <Sparkles size={10} />
                    Plan completo
                  </div>

                  <div className="flex items-center justify-center gap-10">
                    <div>
                      <p className="text-5xl font-bold text-white font-[family-name:var(--font-cormorant)]">2.500<span className="text-lg font-normal text-white/40 ml-1">EUR</span></p>
                      <p className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">Setup inicial</p>
                    </div>
                    <div className="w-px h-16 bg-white/10" />
                    <div>
                      <p className="text-5xl font-bold font-[family-name:var(--font-cormorant)]">
                        <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">490</span>
                        <span className="text-lg font-normal text-white/40 ml-1">EUR/mes</span>
                      </p>
                      <p className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">Todo incluido</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-10">
                <ul className="space-y-4">
                  {FEATURES.map((feature, i) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#0b5faa]/8">
                        <Check size={11} className="text-[#0b5faa]" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-10 pb-10">
                <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-[#0b5faa]/20 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #0a2540, #0b5faa)' }}
                >
                  Empezar ahora
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-gray-400">
            ¿Mas de una tienda?{' '}
            <Link href="/contact" className="text-[#0b5faa] hover:underline underline-offset-2 font-medium">
              Contacta para plan Enterprise →
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
