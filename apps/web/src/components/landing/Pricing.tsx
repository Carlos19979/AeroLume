'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

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
    <section id="pricing" className="py-24" style={{ background: 'linear-gradient(180deg, #f8fafc, #f0f4f8)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[family-name:var(--font-cormorant)]">
            Un precio. Sin sorpresas.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="rounded-3xl bg-white border border-gray-200 shadow-xl shadow-black/[0.04] overflow-hidden">
            {/* Header */}
            <div className="p-8 text-center border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #0a254008, transparent)' }}>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-4xl font-bold text-gray-900">2.500 <span className="text-lg font-medium text-gray-400">EUR</span></p>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Configuracion inicial</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <p className="text-4xl font-bold" style={{ color: '#0b5faa' }}>490 <span className="text-lg font-medium text-gray-400">EUR/mes</span></p>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Todo incluido</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="p-8">
              <ul className="space-y-3">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#0b5faa15' }}>
                      <Check size={12} style={{ color: '#0b5faa' }} />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="px-8 pb-8">
              <a
                href="/signup"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                style={{ backgroundColor: '#0b5faa' }}
              >
                Empezar ahora
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-400">
            ¿Mas de una tienda?{' '}
            <a href="/contact" className="text-gray-600 hover:text-gray-900 underline underline-offset-2">
              Contacta para plan Enterprise
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
