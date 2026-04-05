'use client';

export default function MarketingError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <h2 className="text-2xl font-bold text-[#0a2540] mb-3 font-[family-name:var(--font-cormorant)]">
        Algo salió mal
      </h2>
      <p className="text-gray-500 mb-6 max-w-md">
        Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, #0a2540, #0b5faa)' }}
      >
        Intentar de nuevo
      </button>
    </section>
  );
}
