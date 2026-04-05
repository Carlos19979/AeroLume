'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Algo salió mal</h2>
      <p className="text-gray-500 mb-4">Ha ocurrido un error inesperado.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
