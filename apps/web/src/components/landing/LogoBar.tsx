'use client';

import { motion } from 'framer-motion';

const BRANDS = [
  { name: 'Veleria Sur', country: 'ES' },
  { name: 'NordSails', country: 'BCN' },
  { name: 'Atlantic Voiles', country: 'FR' },
  { name: 'Mediterranean Sails', country: 'IT' },
  { name: 'Velature Ligure', country: 'GE' },
  { name: 'Porto Velas', country: 'PT' },
];

export function LogoBar() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">
            Proveedores que ya confian en Aerolume
          </p>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {BRANDS.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity duration-300"
            >
              <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4 20h16L12 2z" opacity="0.2" fill="#9ca3af" />
                  <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 tracking-tight leading-none">{brand.name}</p>
                <p className="text-[9px] text-gray-400 tracking-wide">{brand.country}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
