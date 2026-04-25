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
  [key: string]: string | null | boolean;
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

const SAIL_GROUPS: Record<string, { label: string; keys: string[]; color: string; chip: string }> = {
  main: {
    label: 'Mayor',
    keys: ['gvstd', 'gvfull', 'gve'],
    color: 'bg-[var(--color-accent)]',
    chip: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  },
  head: {
    label: 'Proa',
    keys: ['gse', 'gn'],
    color: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  },
  downwind: {
    label: 'Empopada',
    keys: ['gen', 'spisym', 'spiasy', 'furling'],
    color: 'bg-violet-500',
    chip: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
  },
};

const RIG_LABELS: Record<string, { short: string; full: string }> = {
  i: { short: 'I', full: 'Altura proa' },
  j: { short: 'J', full: 'Base proa' },
  p: { short: 'P', full: 'Gratil mayor' },
  e: { short: 'E', full: 'Base mayor' },
  gg: { short: 'GG', full: 'Grátil génova' },
  lp: { short: 'LP', full: 'Perpendicular larga' },
  sl: { short: 'SL', full: 'Gratil spinnaker' },
  smw: { short: 'SMW', full: 'Amplitud spinnaker' },
};

export function BoatsClient() {
  const [boatsList, setBoatsList] = useState<BoatRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 50, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBoat, setSelectedBoat] = useState<BoatDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBoats(page: number, searchQuery?: string) {
    setLoading(true);
    try {
      setError(null);
      const params = new URLSearchParams({ page: String(page), pageSize: '50' });
      if (searchQuery && searchQuery.length >= 2) params.set('search', searchQuery);

      const res = await fetch(`/api/internal/boats?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data, pagination: pag } = await res.json();
      setBoatsList(data || []);
      setPagination(pag || { page: 1, pageSize: 50, total: 0, totalPages: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBoats(1); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchBoats(1, search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleViewBoat(id: string) {
    setDetailLoading(true);
    try {
      setError(null);
      const res = await fetch(`/api/internal/boats/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      setSelectedBoat(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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
            className="fixed inset-0 bg-[var(--color-navy)]/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedBoat(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col ring-1 ring-gray-200">
              {detailLoading ? (
                <div className="p-16 text-center text-gray-500">Cargando...</div>
              ) : selectedBoat && (
                <BoatDetailModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function BoatDetailModal({ boat, onClose }: { boat: BoatDetail; onClose: () => void }) {
  const areas = Object.entries(SAIL_AREA_LABELS)
    .map(([key, label]) => ({ key, label, val: Number(boat[key]) || 0 }))
    .filter((a) => a.val > 0);
  const totalArea = areas.reduce((sum, a) => sum + a.val, 0);
  const maxArea = Math.max(...areas.map((a) => a.val), 1);

  const rigEntries = Object.entries(RIG_LABELS)
    .map(([key, label]) => ({ key, ...label, val: Number(boat[key]) || 0 }))
    .filter((r) => r.val > 0);

  const iVal = Number(boat.i) || 0;
  const jVal = Number(boat.j) || 0;
  const pVal = Number(boat.p) || 0;
  const eVal = Number(boat.e) || 0;
  const hasMain = pVal > 0 && eVal > 0;
  const hasHead = iVal > 0 && jVal > 0;
  const hasDiagram = hasMain || hasHead;

  const groupColor = (key: string) => {
    for (const g of Object.values(SAIL_GROUPS)) {
      if (g.keys.includes(key)) return g.color;
    }
    return 'bg-gray-400';
  };
  const groupChip = (key: string) => {
    for (const g of Object.values(SAIL_GROUPS)) {
      if (g.keys.includes(key)) return g.chip;
    }
    return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
  };
  const groupLabel = (key: string) => {
    for (const g of Object.values(SAIL_GROUPS)) {
      if (g.keys.includes(key)) return g.label;
    }
    return '';
  };

  return (
    <>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            <span>{boat.tenantId ? 'Personalizado' : 'Catálogo global'}</span>
            <span className="text-gray-300">·</span>
            <span>{boat.isMultihull ? 'Multicasco' : 'Monocasco'}</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-gray-900 truncate">{boat.model}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {boat.length ? (
              <>Eslora <span className="font-semibold text-gray-700 tabular-nums">{boat.length} m</span></>
            ) : (
              'Eslora no disponible'
            )}
            {totalArea > 0 && (
              <>
                <span className="mx-2 text-gray-300">·</span>
                Superficie total <span className="font-semibold text-gray-700 tabular-nums">{totalArea.toFixed(1)} m²</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="shrink-0 w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

        {/* Rig section */}
        {rigEntries.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h4 className="text-[11px] uppercase tracking-[0.14em] text-gray-500 font-semibold">Aparejo</h4>
              <span className="text-[11px] text-gray-400">medidas en metros</span>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Diagram */}
              {hasDiagram && (
                <div className="col-span-12 md:col-span-5">
                  <RigDiagram
                    i={iVal}
                    j={jVal}
                    p={pVal}
                    e={eVal}
                    hasMain={hasMain}
                    hasHead={hasHead}
                  />
                </div>
              )}

              {/* Values */}
              <div className={hasDiagram ? 'col-span-12 md:col-span-7' : 'col-span-12'}>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 rounded-xl overflow-hidden ring-1 ring-gray-100">
                  {rigEntries.map((r) => (
                    <div key={r.key} className="bg-white px-3 py-3">
                      <dt className="text-[10px] uppercase tracking-[0.14em] text-gray-400 font-semibold">{r.short}</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
                        {r.val.toFixed(2)}
                        <span className="text-xs font-medium text-gray-400 ml-0.5">m</span>
                      </dd>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">{r.full}</div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        )}

        {/* Sail areas */}
        {areas.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h4 className="text-[11px] uppercase tracking-[0.14em] text-gray-500 font-semibold">Superficies de vela</h4>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                {Object.entries(SAIL_GROUPS).map(([key, g]) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${g.color}`} /> {g.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {areas
                .sort((a, b) => b.val - a.val)
                .map(({ key, label, val }) => {
                  const pct = (val / maxArea) * 100;
                  return (
                    <div key={key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                      <div className="min-w-[11rem] flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${groupChip(key)}`}>
                          {groupLabel(key)}
                        </span>
                        <span className="text-sm text-gray-700 truncate">{label}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${groupColor(key)} transition-[width] duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums w-20 text-right">
                        {val.toFixed(2)}
                        <span className="text-xs font-medium text-gray-400 ml-0.5">m²</span>
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Group totals */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
              {Object.entries(SAIL_GROUPS).map(([key, g]) => {
                const total = g.keys.reduce((sum, k) => sum + (Number(boat[k]) || 0), 0);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-8 rounded-full ${g.color}`} />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500 font-semibold">{g.label}</p>
                        <p className="text-[11px] text-gray-400">{g.keys.filter((k) => Number(boat[k]) > 0).length} velas</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {total > 0 ? total.toFixed(1) : '—'}
                      {total > 0 && <span className="text-xs font-medium text-gray-400 ml-0.5">m²</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {areas.length === 0 && rigEntries.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">Sin datos técnicos disponibles para este barco.</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <p className="text-[11px] text-gray-400 font-mono truncate">ID {boat.id.slice(0, 8)}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </>
  );
}

function RigDiagram({ i, j, p, e, hasMain, hasHead }: { i: number; j: number; p: number; e: number; hasMain: boolean; hasHead: boolean }) {
  // Viewbox: 200 x 240, bottom = deck line at y=210, mast at x=100.
  const maxH = Math.max(i, p, 1);
  const maxW = Math.max(j, e, 1);
  const scale = Math.min(180 / maxH, 90 / maxW);
  const hI = i * scale;
  const wJ = j * scale;
  const hP = p * scale;
  const wE = e * scale;

  const mastX = 100;
  const deckY = 210;
  const mastTop = deckY - hP;
  const headTop = deckY - hI;
  const boomEnd = mastX + wE;
  const headFoot = mastX + wJ;
  const mastReach = hasMain ? mastTop : hasHead ? headTop : deckY - 120;

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-50/60 to-white ring-1 ring-blue-100 p-4 h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500 font-semibold">Plano vélico</p>
        {!(hasMain && hasHead) && (
          <span className="text-[9px] uppercase tracking-wider text-amber-600 font-semibold">
            {!hasHead ? 'Sin foretriangle' : 'Sin mayor'}
          </span>
        )}
      </div>
      <svg viewBox="0 0 200 240" className="w-full flex-1" preserveAspectRatio="xMidYMax meet">
        {/* Waterline / deck */}
        <line x1="6" y1={deckY} x2="194" y2={deckY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="30" y1={deckY + 8} x2="170" y2={deckY + 8} stroke="#cbd5e1" strokeWidth="1" />

        {/* Mainsail */}
        {hasMain && (
          <>
            <polygon
              points={`${mastX},${mastTop} ${mastX},${deckY} ${boomEnd},${deckY}`}
              fill="rgba(11,95,170,0.12)"
              stroke="#0b5faa"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <line x1={mastX} y1={deckY} x2={boomEnd} y2={deckY} stroke="#0a2540" strokeWidth="2" strokeLinecap="round" />
            <text x={mastX - 6} y={(mastTop + deckY) / 2} textAnchor="end" fontSize="10" fill="#0a2540" fontWeight="600">P</text>
            <text x={(mastX + boomEnd) / 2} y={deckY + 18} textAnchor="middle" fontSize="10" fill="#0a2540" fontWeight="600">E</text>
          </>
        )}
        {/* Headsail / foretriangle */}
        {hasHead && (
          <>
            <polygon
              points={`${mastX},${headTop} ${mastX},${deckY} ${headFoot},${deckY}`}
              fill="rgba(16,185,129,0.10)"
              stroke="#10b981"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <text x={mastX + 4} y={(headTop + deckY) / 2} textAnchor="start" fontSize="10" fill="#10b981" fontWeight="600">I</text>
            <text x={(mastX + headFoot) / 2} y={deckY - 4} textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="600">J</text>
          </>
        )}
        {/* Mast */}
        <line x1={mastX} y1={mastReach - 4} x2={mastX} y2={deckY} stroke="#0a2540" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
