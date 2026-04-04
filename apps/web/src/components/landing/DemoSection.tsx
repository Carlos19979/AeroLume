'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EmbedConfigurator } from '@/app/embed/configurator';

const DEMO_TENANT = {
  id: 'demo',
  name: 'Tu Veleria',
  slug: 'demo',
  themeAccent: '#0b5faa',
  themeColorMain: '#3b82f6',
  themeColorHead: '#10b981',
  themeColorSpi: '#a855f7',
  locale: 'es',
  currency: 'EUR',
};

const DEMO_API_KEY = 'ak_26a3b7a817ba23d1fc9488daf2a154759bb66197';

export function DemoSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[family-name:var(--font-cormorant)]">
            Pruebalo ahora
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Asi es como tus clientes configuraran sus velas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Browser chrome */}
          <div className="rounded-t-2xl border border-gray-200 border-b-0 bg-gray-50 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-yellow-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-400 text-center">
                tuveleria.com/configurador
              </div>
            </div>
          </div>
          {/* Live configurator */}
          <div className="border border-gray-200 rounded-b-2xl bg-white overflow-hidden shadow-xl shadow-black/[0.06]">
            <EmbedConfigurator apiKey={DEMO_API_KEY} tenant={DEMO_TENANT} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Ver a pantalla completa
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
