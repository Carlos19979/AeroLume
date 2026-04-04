'use client';

const EVENT_TYPE_LABELS: Record<string, string> = {
  configurator_opened: 'Configurador abierto',
  boat_search: 'Búsqueda de barco',
  boat_selected: 'Barco seleccionado',
  product_view: 'Producto visto',
  product_selected: 'Producto seleccionado',
  quote_created: 'Presupuesto creado',
  configure_started: 'Configuración iniciada',
};

const SAIL_TYPE_LABELS: Record<string, string> = {
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

type AnalyticsData = {
  total: number;
  byType: { eventType: string; count: number }[];
  topBoats: { boatModel: string | null; count: number }[];
  topSailTypes: { sailType: string | null; count: number }[];
  perDay: { date: string | null; count: number }[];
};

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const maxPerDay = Math.max(...data.perDay.map((d) => d.count), 1);

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Eventos totales"
          value={data.total}
          color="text-gray-900"
        />
        <StatCard
          label="Presupuestos"
          value={data.byType.find((t) => t.eventType === 'quote_created')?.count ?? 0}
          color="text-green-600"
        />
        <StatCard
          label="Barcos buscados"
          value={data.byType.find((t) => t.eventType === 'boat_search')?.count ?? 0}
          color="text-blue-600"
        />
        <StatCard
          label="Productos vistos"
          value={data.byType.find((t) => t.eventType === 'product_view')?.count ?? 0}
          color="text-purple-600"
        />
      </div>

      {/* Activity chart (last 30 days) */}
      {data.perDay.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Actividad (últimos 30 días)</h3>
          <div className="flex items-end gap-1 h-32">
            {data.perDay.map((day) => (
              <div
                key={day.date}
                className="flex-1 rounded-t relative group"
                style={{
                  height: `${(day.count / maxPerDay) * 100}%`,
                  backgroundColor: 'var(--accent, #0b5faa)',
                  minHeight: day.count > 0 ? '4px' : '0',
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {day.date}: {day.count}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{data.perDay[0]?.date}</span>
            <span>{data.perDay[data.perDay.length - 1]?.date}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Events by type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Eventos por tipo</h3>
          {data.byType.length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {data.byType.map((item) => (
                <div key={item.eventType} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {EVENT_TYPE_LABELS[item.eventType] || item.eventType}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top boats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Barcos más buscados</h3>
          {data.topBoats.length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {data.topBoats.map((item, i) => (
                <div key={item.boatModel} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    <span className="text-gray-300 mr-2">{i + 1}.</span>
                    {item.boatModel}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top sail types */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Tipos de vela populares</h3>
          {data.topSailTypes.length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos todavía.</p>
          ) : (
            <div className="space-y-3">
              {data.topSailTypes.map((item) => (
                <div key={item.sailType} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {SAIL_TYPE_LABELS[item.sailType || ''] || item.sailType}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {data.total === 0 && (
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-sm text-blue-700">
            Los datos de analytics aparecerán aquí cuando los visitantes empiecen a usar el configurador embebido.
          </p>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className={`text-2xl font-semibold ${color}`}>{value.toLocaleString('es')}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
