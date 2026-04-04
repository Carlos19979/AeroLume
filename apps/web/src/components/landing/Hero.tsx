'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[100vh]" style={{ background: 'linear-gradient(160deg, #040e1a 0%, #0a2540 40%, #0d3158 70%, #0a2540 100%)' }}>
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #4da3ff, transparent 65%)' }} />
      <div className="absolute bottom-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #0b5faa, transparent 65%)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Horizontal line accent */}
      <div className="absolute top-[45%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 lg:pt-44 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Copy — takes 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-7"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50 tracking-wide">Plataforma SaaS para el sector nautico</span>
            </motion.div>

            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[4.25rem] font-bold text-white leading-[1.15] tracking-tight font-[family-name:var(--font-cormorant)]">
              El configurador de velas{' '}
              <span className="italic" style={{ color: '#7dd3fc' }}>
                que vende por ti
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-white/45 leading-relaxed max-w-xl">
              Embebe un configurador premium en tu web. Tus clientes eligen barco, configuran la vela y solicitan presupuesto.{' '}
              <span className="text-white/65">Tu solo cierras la venta.</span>
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/contact"
                className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-semibold text-[#0a2540] bg-white transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
              >
                Solicitar demo
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="/#producto"
                className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-sm font-medium text-white/50 hover:text-white/80 transition-all duration-300"
              >
                Conocer mas
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Trust stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-14 pt-6 border-t border-white/[0.06]"
            >
              <p className="text-sm text-white/30">
                <span className="text-white/50 font-medium">4.839+</span> barcos
                <span className="mx-3 text-white/15">·</span>
                <span className="text-white/50 font-medium">9</span> tipos de vela
                <span className="mx-3 text-white/15">·</span>
                Setup en <span className="text-white/50 font-medium">48 horas</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Browser mockup — takes 5 cols */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            {/* Glow behind */}
            <div className="absolute -inset-8 -z-10 rounded-[2rem] opacity-40 blur-[60px]" style={{ background: 'linear-gradient(135deg, #0b5faa, #4da3ff, #0b5faa)' }} />

            <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/50 bg-black/20 backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 mx-6">
                  <div className="bg-white/[0.05] rounded-lg px-3 py-1 text-[10px] text-white/25 text-center font-mono">
                    tuveleria.com/configurador
                  </div>
                </div>
              </div>
              {/* Widget preview */}
              <div className="p-5 bg-white">
                <div className="text-center mb-3">
                  <p className="text-base font-bold text-gray-900">Configurador de Velas</p>
                  <p className="text-[10px] text-gray-400">por Tu Veleria</p>
                </div>
                <div className="flex justify-center gap-1 mb-3">
                  {['✓ Barco', 'Vela', 'Opciones', 'Contacto'].map((label, i) => (
                    <span key={label} className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium ${i < 2 ? 'text-white' : 'bg-gray-100 text-gray-400'}`} style={i < 2 ? { backgroundColor: '#0b5faa' } : undefined}>
                      {label}
                    </span>
                  ))}
                </div>
                <div className="mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-medium">BAVARIA 38 CRUISER · 11.83m</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Mayor Clasica Horizontal', area: '25.9', price: '1.165' },
                    { name: 'Mayor Full Batten Horizontal', area: '26.4', price: '1.188' },
                    { name: 'Mayor Enrollable Horizontal', area: '22.8', price: '1.256' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 text-left" style={i === 0 ? { borderColor: '#0b5faa25', background: '#0b5faa04' } : {}}>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[9px] text-gray-400">{item.area} m²</p>
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#0b5faa' }}>{item.price} EUR</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -left-6 bottom-16 bg-white rounded-xl shadow-xl shadow-black/10 px-4 py-3 border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-900">Nuevo presupuesto</p>
                  <p className="text-[9px] text-gray-400">Bavaria 38 · 1.256 EUR</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 0 480 50 720 30C960 10 1200 45 1440 20V60H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
