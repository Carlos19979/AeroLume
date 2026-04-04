'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-24" style={{ background: 'linear-gradient(135deg, #0a2540, #0f3460)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-cormorant)]">
            ¿Listo para vender mas velas?
          </h2>
          <p className="mt-4 text-lg text-white/50 max-w-md mx-auto">
            Empieza hoy. Tu configurador estara listo en 48 horas.
          </p>
          <div className="mt-8">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold bg-white text-gray-900 transition-all duration-200 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
            >
              Solicitar demo
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/25">
            <span>Sin compromiso</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Setup en 48h</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Soporte incluido</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
