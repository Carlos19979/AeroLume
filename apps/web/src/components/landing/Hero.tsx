'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0f3460 50%, #0a2540 100%)' }}>
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #0b5faa 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight font-[family-name:var(--font-cormorant)]">
              El configurador de velas{' '}
              <span className="italic" style={{ color: '#4da3ff' }}>que vende por ti</span>
            </h1>
            <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-lg">
              Embebe un configurador premium en tu web. Tus clientes eligen barco, configuran la vela y solicitan presupuesto. Tu solo cierras la venta.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                style={{ backgroundColor: '#0b5faa' }}
              >
                Solicitar demo
                <ArrowRight size={16} />
              </a>
              <a
                href="/demo"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                Ver demo en vivo
                <ArrowRight size={14} />
              </a>
            </div>
            {/* Trust bar */}
            <div className="mt-12 flex items-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                4.839 barcos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                9 tipos de vela
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                Integracion en minutos
              </span>
            </div>
          </motion.div>

          {/* Right: Browser mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-white/8 rounded-lg px-3 py-1 text-[10px] text-white/30 text-center">
                    tuveleria.com/configurador
                  </div>
                </div>
              </div>
              {/* Widget preview (static) */}
              <div className="p-6 bg-white">
                <div className="text-center mb-4">
                  <p className="text-lg font-bold text-gray-900">Configurador de Velas</p>
                  <p className="text-xs text-gray-400">por Tu Veleria</p>
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: '#0b5faa' }}>✓ Barco</span>
                  <span className="w-4 h-px bg-gray-200 self-center" />
                  <span className="px-3 py-1 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: '#0b5faa' }}>Vela</span>
                  <span className="w-4 h-px bg-gray-200 self-center" />
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] text-gray-400">Opciones</span>
                  <span className="w-4 h-px bg-gray-200 self-center" />
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] text-gray-400">Contacto</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">BAVARIA 38 CRUISER 11.83m</span>
                </div>
                <div className="space-y-2">
                  {['Mayor Clasica Horizontal', 'Mayor Full Batten Horizontal', 'Mayor Enrollable Horizontal'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100" style={i === 0 ? { borderColor: '#0b5faa30', background: '#0b5faa05' } : {}}>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{name}</p>
                        <p className="text-[10px] text-gray-400">22.8 m²</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#0b5faa' }}>{[1027, 1188, 1256][i]} EUR</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating accent glow behind */}
            <div className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-3xl" style={{ background: 'linear-gradient(135deg, #0b5faa, #1a7fd4)' }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
