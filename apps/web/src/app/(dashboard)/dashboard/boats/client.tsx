'use client';

import { useState, useEffect } from 'react';

type BoatRow = {
  id: string;
  model: string;
  boatModel: string | null;
  length: string | null;
  isMultihull: boolean | null;
  tenantId: string | null;
};

type BoatDetail = BoatRow & {
  i: string | null;
  j: string | null;
  p: string | null;
  e: string | null;
  gg: string | null;
  lp: string | null;
  sl: string | null;
  smw: string | null;
  genoaArea: string | null;
  genoaFurlerArea: string | null;
  mainsailArea: string | null;
  mainsailFullArea: string | null;
  mainsailFurlerArea: string | null;
  spinnakerArea: string | null;
  spinnakerAsymArea: string | null;
  sgenArea: string | null;
  gvstd: string | null;
  gvfull: string | null;
  gve: string | null;
  gse: string | null;
  gn: string | null;
  gen: string | null;
  spisym: string | null;
  spiasy: string | null;
  furling: string | null;
  [key: string]: any;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const SAIL_AREA_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clásica',
  gvfull: 'Mayor Full Batten',
  gve: 'Mayor Enrollable',
  gse: 'Génova Enrollable',
  gn: 'Génova Mosquetones',
  gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simétrico',
  spiasy: 'Spinnaker Asimétrico',
  furling: 'Code S',
};

const RIG_LABELS: Record<string, string> = {
  i: 'I (Altura proa)',
  j: 'J (Base proa)',
  p: 'P (Gratil mayor)',
  e: 'E (Base mayor)',
  gg: 'GG',
  lp: 'LP',
  sl: 'SL',
  smw: 'SMW',
};

export function BoatsClient() {
  const [boatsList, setBoatsList] = useState<BoatRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 50, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBoat, setSelectedBoat] = useState<BoatDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function fetchBoats(page: number, searchQuery?: string) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: '50' });
    if (searchQuery && searchQuery.length >= 2) params.set('search', searchQuery);

    const res = await fetch(`/api/internal/boats?${params}`);
    const { data, pagination: pag } = await res.json();
    setBoatsList(data || []);
    setPagination(pag || { page: 1, pageSize: 50, total: 0, totalPages: 0 });
    setLoading(false);
  }

  useEffect(() => { fetchBoats(1); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchBoats(1, search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleViewBoat(id: string) {
    setDetailLoading(true);
    const res = await fetch(`/api/internal/boats/${id}`);
    const { data } = await res.json();
    setSelectedBoat(data);
    setDetailLoading(false);
  }

  return (
    <>
      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar barcos por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <span className="text-sm text-gray-400">
          {pagination.total.toLocaleString('es')} barcos
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
        ) : boatsList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No se encontraron barcos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Modelo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Eslora</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Origen</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boatsList.map((boat) => (
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
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewBoat(boat.id)}
                      className="text-[var(--accent)] hover:underline text-xs"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchBoats(pagination.page - 1, search)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              &larr; Anterior
            </button>
            <button
              onClick={() => fetchBoats(pagination.page + 1, search)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Boat detail modal */}
      {(selectedBoat || detailLoading) && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedBoat(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {detailLoading ? 'Cargando...' : selectedBoat?.model}
                </h3>
                <button
                  onClick={() => setSelectedBoat(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  &times;
                </button>
              </div>

              {selectedBoat && (
                <div className="space-y-6">
                  {/* General info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Información general</h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-gray-400">Modelo</dt>
                        <dd className="text-gray-900 font-medium">{selectedBoat.model}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-400">Eslora</dt>
                        <dd className="text-gray-900">{selectedBoat.length ? `${selectedBoat.length}m` : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-400">Tipo</dt>
                        <dd className="text-gray-900">{selectedBoat.isMultihull ? 'Multicasco' : 'Monocasco'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-400">Origen</dt>
                        <dd className="text-gray-900">{selectedBoat.tenantId ? 'Personalizado' : 'Global'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Rig dimensions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Medidas del aparejo</h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(RIG_LABELS).map(([key, label]) => {
                        const val = selectedBoat[key];
                        if (!val || val === '0.00') return null;
                        return (
                          <div key={key}>
                            <dt className="text-gray-400">{label}</dt>
                            <dd className="text-gray-900 font-mono">{Number(val).toFixed(2)}m</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>

                  {/* Sail areas */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Áreas de vela (m²)</h4>
                    <div className="space-y-1.5">
                      {Object.entries(SAIL_AREA_LABELS).map(([key, label]) => {
                        const val = selectedBoat[key];
                        if (!val || val === '0.00') return null;
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-mono text-gray-900 font-medium">{Number(val).toFixed(2)} m²</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Raw sail areas */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Áreas calculadas</h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        { key: 'mainsailArea', label: 'Mayor' },
                        { key: 'mainsailFullArea', label: 'Mayor Full' },
                        { key: 'mainsailFurlerArea', label: 'Mayor Enrollable' },
                        { key: 'genoaArea', label: 'Génova' },
                        { key: 'genoaFurlerArea', label: 'Génova Enrollable' },
                        { key: 'spinnakerArea', label: 'Spinnaker' },
                        { key: 'spinnakerAsymArea', label: 'Spinnaker Asim.' },
                        { key: 'sgenArea', label: 'Sgen' },
                      ].map(({ key, label }) => {
                        const val = selectedBoat[key];
                        if (!val || val === '0.00') return null;
                        return (
                          <div key={key}>
                            <dt className="text-gray-400">{label}</dt>
                            <dd className="text-gray-900 font-mono">{Number(val).toFixed(2)} m²</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
