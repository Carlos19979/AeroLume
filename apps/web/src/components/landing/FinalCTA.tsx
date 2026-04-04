'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(160deg, #040e1a 0%, #0a2540 40%, #0d3158 70%, #0a2540 100%)' }}>
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

      {/* Orbs */}
      <div className="absolute top-[-30%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #4da3ff, transparent 65%)' }} />
      <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #0b5faa, transparent 65%)' }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] font-[family-name:var(--font-cormorant)]">
            ¿Listo para vender
            <br />
            <span className="italic bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">mas velas?</span>
          </h2>
          <p className="mt-6 text-lg text-white/40 max-w-md mx-auto leading-relaxed">
            Empieza hoy. Tu configurador estara listo en 48 horas.
          </p>
          <div className="mt-10">
            <a
              href="/contact"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold bg-white text-[#0a2540] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
            >
              Solicitar demo
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
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
