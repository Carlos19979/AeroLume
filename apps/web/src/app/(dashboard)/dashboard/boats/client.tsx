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
          className="flex-1 max-w-md border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <span className="text-sm text-gray-500">
          {pagination.total.toLocaleString('es')} barcos
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Cargando...</div>
        ) : boatsList.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No se encontraron barcos.</div>
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
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {boat.tenantId ? 'Personalizado' : 'Global'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewBoat(boat.id)}
                      className="text-[var(--color-accent)] hover:underline text-xs"
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSelectedBoat(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              {detailLoading ? (
                <div className="p-12 text-center text-gray-500">Cargando...</div>
              ) : selectedBoat && (
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-accent)] text-white p-6 rounded-t-2xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{selectedBoat.model}</h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                          {selectedBoat.length && (
                            <span className="flex items-center gap-1">
                              <span className="text-white/50">Eslora:</span> {selectedBoat.length}m
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-white/15 text-xs">
                            {selectedBoat.isMultihull ? 'Multicasco' : 'Monocasco'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/15 text-xs">
                            {selectedBoat.tenantId ? 'Personalizado' : 'Global'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBoat(null)}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                      >
                        <span className="text-lg leading-none">&times;</span>
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                    {/* Rig dimensions */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Medidas del aparejo</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(RIG_LABELS).map(([key, label]) => {
                          const val = selectedBoat[key];
                          if (!val || val === '0.00') return null;
                          return (
                            <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                              <p className="text-lg font-semibold text-gray-900 font-mono">{Number(val).toFixed(2)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sail areas */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Areas de vela</h4>
                      <div className="space-y-2">
                        {(() => {
                          const areas = Object.entries(SAIL_AREA_LABELS)
                            .map(([key, label]) => ({ key, label, val: Number(selectedBoat[key]) || 0 }))
                            .filter((a) => a.val > 0);
                          const maxArea = Math.max(...areas.map((a) => a.val), 1);
                          return areas.map(({ key, label, val }) => (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-40 shrink-0">{label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dim,#1a7fd4)]"
                                  style={{ width: `${(val / maxArea) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-mono font-medium text-gray-900 w-20 text-right">{val.toFixed(2)} m²</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
