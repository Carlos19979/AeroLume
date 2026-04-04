'use client';

import { motion } from 'framer-motion';

const BRANDS = [
  'Veleria Sur',
  'NordSails BCN',
  'Atlantic Voiles',
  'Mediterranean Sails',
  'Velature Ligure',
  'Porto Velas',
];

export function LogoBar() {
  return (
    <section className="py-12 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs uppercase tracking-widest text-gray-400 font-medium mb-8"
        >
          Utilizado por proveedores de velas en toda Europa
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {BRANDS.map((brand, i) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-lg font-semibold text-gray-300 tracking-tight font-[family-name:var(--font-cormorant)]"
            >
              {brand}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
