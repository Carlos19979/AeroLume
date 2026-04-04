'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const QUESTIONS = [
  {
    q: '¿Como se integra el widget?',
    a: 'Copia 3 lineas de codigo HTML en tu web. El widget se adapta automaticamente al ancho del contenedor y puedes personalizar colores y fuentes desde el dashboard.',
  },
  {
    q: '¿Puedo personalizar los colores y el logo?',
    a: 'Si. Desde el dashboard puedes cambiar el color principal, los colores secundarios, las fuentes y añadir tu logo. El widget se adapta a la identidad de tu marca.',
  },
  {
    q: '¿Que barcos incluye?',
    a: 'Nuestra base de datos tiene 4.839 modelos con medidas de aparejo verificadas (P, E, I, J, eslora). Si falta algun modelo, lo añadimos en menos de 24 horas.',
  },
  {
    q: '¿Hay compromiso de permanencia?',
    a: 'No. Puedes cancelar en cualquier momento sin penalizaciones. El setup inicial cubre la configuracion y onboarding de tu cuenta.',
  },
  {
    q: '¿Como funciona el soporte?',
    a: 'Email y chat. Respondemos en menos de 24 horas en dias laborables. Para el plan Enterprise ofrecemos soporte prioritario y un gestor de cuenta dedicado.',
  },
  {
    q: '¿Puedo añadir mis propios barcos?',
    a: 'Si. Desde el dashboard puedes gestionar barcos personalizados que solo veran tus clientes, ademas de tener acceso a toda la base de datos global.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '200px' : '0', opacity: open ? 1 : 0 }}
      >
        <p className="text-sm text-gray-500 leading-relaxed pb-5">{a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[family-name:var(--font-cormorant)]">
            Preguntas frecuentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-gray-100 bg-white px-6"
        >
          {QUESTIONS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
