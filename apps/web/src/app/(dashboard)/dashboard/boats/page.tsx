import { BoatsClient } from './client';

export default function BoatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Barcos</h2>
        <p className="text-gray-500 mt-1">
          Base de datos de barcos disponibles en tu configurador.
        </p>
      </div>
      <BoatsClient />
    </div>
  );
}
