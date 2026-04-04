'use client';

import { useState } from 'react';

type BoatRow = {
  id: string;
  model: string;
  boatModel: string | null;
  length: string | null;
  isMultihull: boolean | null;
  tenantId: string | null;
};

export function BoatsClient({ initialBoats, totalCount }: { initialBoats: BoatRow[]; totalCount: number }) {
  const [search, setSearch] = useState('');

  const filtered = search.length >= 2
    ? initialBoats.filter((b) =>
        b.model.toLowerCase().includes(search.toLowerCase())
      )
    : initialBoats;

  return (
    <>
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Filtrar barcos por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        {search.length >= 2 && (
          <p className="text-xs text-gray-400 mt-1">
            {filtered.length} resultados (mostrando primeros 100 de {totalCount.toLocaleString('es')})
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Modelo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Eslora</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((boat) => (
              <tr key={boat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{boat.model}</td>
                <td className="px-4 py-3 text-gray-500">
                  {boat.length ? `${boat.length}m` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {boat.isMultihull ? (
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">Multicasco</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Monocasco</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {boat.tenantId ? 'Personalizado' : 'Global'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        Se muestran los primeros 100 barcos. Los clientes pueden buscar entre todos los {totalCount.toLocaleString('es')} barcos desde el configurador.
      </div>
    </>
  );
}
