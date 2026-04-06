'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-dark-gradient">
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03] bg-grain" />

      {/* Orbs */}
      <div className="absolute top-[-30%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #4da3ff, transparent 65%)' }} />
      <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #0b5faa, transparent 65%)' }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02] bg-dot-grid" />

      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] font-[family-name:var(--font-cormorant)]">
            ¿Listo para vender
            <br />
            <span className="italic" style={{ color: '#7dd3fc' }}>mas velas?</span>
          </h2>
          <p className="mt-6 text-lg text-white/40 max-w-md mx-auto leading-relaxed">
            Registrate gratis y prueba el configurador durante 7 dias.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold bg-white text-[#0a2540] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
            >
              Registrate gratis
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-xs text-white/20 tracking-wide">
            <span>Sin compromiso</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Setup en 48h</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>Soporte incluido</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
