'use client';

import { EVENT_TYPE_LABELS, SAIL_TYPE_LABELS } from '@/lib/constants';

type AnalyticsData = {
  total: number;
  byType: { eventType: string; count: number }[];
  topBoats: { boatModel: string | null; count: number }[];
  topSailTypes: { sailType: string | null; count: number }[];
  perDay: { date: string | null; count: number }[];
  acceptedQuoteCount: number;
  acceptedQuoteRevenue: number;
  quoteTotalCount: number;
};

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const byType = new Map(data.byType.map((t) => [t.eventType, t.count]));
  const quoteCreated = byType.get('quote_created') ?? 0;
  const boatSearch = byType.get('boat_search') ?? 0;
  const productView = byType.get('product_view') ?? 0;
  const configuratorOpened = byType.get('configurator_opened') ?? 0;

  // Embudo de conversión: aperturas → solicitudes → cerrados
  const openToRequestRate =
    configuratorOpened > 0 ? (quoteCreated / configuratorOpened) * 100 : 0;
  const requestToClosedRate =
    quoteCreated > 0 ? (data.acceptedQuoteCount / quoteCreated) * 100 : 0;
  const openToClosedRate =
    configuratorOpened > 0 ? (data.acceptedQuoteCount / configuratorOpened) * 100 : 0;

  const maxPerDay = Math.max(...data.perDay.map((d) => d.count), 1);
  const activeDays = data.perDay.filter((d) => d.count > 0).length;

  // Empty state — ningún evento todavía
  if (data.total === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center"
        data-testid="analytics-empty-state"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 14l4-4 4 4 5-6" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">
          Todavía no hay datos
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          El widget aún no ha recibido visitantes. Incrusta el configurador en tu sitio y las métricas aparecerán aquí en cuanto empiecen las interacciones.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* KPI cards */}
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        data-testid="analytics-summary"
      >
        <StatCard
          label="Eventos totales"
          value={data.total}
          hint="Todas las interacciones registradas"
          accent="slate"
          testId="analytics-total"
        />
        <StatCard
          label="Presupuestos"
          value={data.quoteTotalCount}
          hint={
            data.acceptedQuoteRevenue > 0
              ? `${data.acceptedQuoteRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} cerrados (${data.acceptedQuoteCount})`
              : 'Presupuestos generados desde el widget'
          }
          accent="emerald"
          testId="analytics-quote-created"
        />
        <StatCard
          label="Barcos buscados"
          value={boatSearch}
          hint="Búsquedas completadas en el widget"
          accent="blue"
          testId="analytics-boat-search"
        />
        <StatCard
          label="Productos vistos"
          value={productView}
          hint="Velas abiertas en detalle"
          accent="violet"
          testId="analytics-product-view"
        />
      </div>

      {/* Conversion funnel */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6" data-testid="analytics-funnel">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Embudo de conversión</h3>
            <p className="text-xs text-gray-500 mt-0.5">Últimos 30 días</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Conversión total</div>
            <div className="text-lg font-semibold tabular-nums text-gray-900">{openToClosedRate.toFixed(1)}%</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-stretch">
          <FunnelStage
            label="Aperturas de configurador"
            value={configuratorOpened}
            tone="slate"
          />
          <FunnelArrow percent={openToRequestRate} />
          <FunnelStage
            label="Solicitudes de presupuestos"
            value={quoteCreated}
            tone="blue"
          />
          <FunnelArrow percent={requestToClosedRate} />
          <FunnelStage
            label="Presupuestos cerrados"
            value={data.acceptedQuoteCount}
            tone="emerald"
          />
        </div>
      </section>

      {/* Secondary insights strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InsightPill
          label="Ingresos cerrados"
          value={data.acceptedQuoteRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          hint="Suma de presupuestos aceptados"
        />
        <InsightPill
          label="Días con actividad"
          value={`${activeDays} / 30`}
          hint="Últimos 30 días"
        />
      </div>

      {/* Activity chart (last 30 days) */}
      {data.perDay.length > 0 && (
        <section
          className="rounded-2xl border border-gray-200 bg-white p-6"
          data-testid="analytics-per-day"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Actividad (últimos 30 días)
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Eventos totales por día
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-gray-400">
                Máx / día
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {maxPerDay.toLocaleString('es')}
              </div>
            </div>
          </div>

          <div className="mt-6 flex h-36 items-end gap-[3px]">
            {data.perDay.map((day) => {
              const pct = (day.count / maxPerDay) * 100;
              return (
                <div
                  key={day.date}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full rounded-t-sm bg-[var(--color-accent,#0b5faa)]/85 transition-all duration-150 hover:bg-[var(--color-accent,#0b5faa)]"
                    style={{
                      height: `${pct}%`,
                      minHeight: day.count > 0 ? '3px' : '0',
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
                    {day.date}: {day.count.toLocaleString('es')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
            <span>{data.perDay[0]?.date}</span>
            <span>{data.perDay[data.perDay.length - 1]?.date}</span>
          </div>
        </section>
      )}

      {/* Grid: events by type + top boats + top sail types */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Events by type */}
        <Card title="Eventos por tipo" testId="analytics-by-type">
          {data.byType.length === 0 ? (
            <EmptyHint />
          ) : (
            <BarList
              items={data.byType.map((item) => ({
                key: item.eventType,
                label: EVENT_TYPE_LABELS[item.eventType] || item.eventType,
                value: item.count,
              }))}
              barColor="bg-[var(--color-accent,#0b5faa)]/80"
            />
          )}
        </Card>

        {/* Top boats */}
        <Card title="Barcos más buscados" testId="analytics-top-boats">
          {data.topBoats.length === 0 ? (
            <EmptyHint />
          ) : (
            <BarList
              items={data.topBoats.map((item, i) => ({
                key: item.boatModel ?? String(i),
                label: item.boatModel ?? 'Sin modelo',
                value: item.count,
                rank: i + 1,
              }))}
              barColor="bg-blue-500/80"
            />
          )}
        </Card>

        {/* Top sail types */}
        <Card title="Tipos de vela populares" testId="analytics-top-sail-types">
          {data.topSailTypes.length === 0 ? (
            <EmptyHint />
          ) : (
            <BarList
              items={data.topSailTypes.map((item, i) => ({
                key: item.sailType ?? String(i),
                label: SAIL_TYPE_LABELS[item.sailType ?? ''] || item.sailType || '—',
                value: item.count,
                rank: i + 1,
              }))}
              barColor="bg-violet-500/80"
            />
          )}
        </Card>
      </div>
    </>
  );
}

// ───────────── Subcomponents ─────────────

type AccentKey = 'slate' | 'emerald' | 'blue' | 'violet';

const ACCENT_STYLES: Record<AccentKey, { value: string; dot: string }> = {
  slate: { value: 'text-gray-900', dot: 'bg-gray-400' },
  emerald: { value: 'text-emerald-600', dot: 'bg-emerald-500' },
  blue: { value: 'text-blue-600', dot: 'bg-blue-500' },
  violet: { value: 'text-violet-600', dot: 'bg-violet-500' },
};

function StatCard({
  label,
  value,
  hint,
  accent,
  testId,
}: {
  label: string;
  value: number;
  hint?: string;
  accent: AccentKey;
  testId?: string;
}) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div
      className="group rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>
      </div>
      <div className={`mt-3 text-3xl font-semibold tabular-nums ${styles.value}`}>
        {value.toLocaleString('es')}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function InsightPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          {label}
        </div>
        {hint && <div className="mt-0.5 text-[11px] text-gray-400">{hint}</div>}
      </div>
      <div className="text-lg font-semibold tabular-nums text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  testId,
}: {
  title: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-6"
      data-testid={testId}
    >
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type BarItem = {
  key: string;
  label: string;
  value: number;
  rank?: number;
};

function BarList({
  items,
  barColor,
}: {
  items: BarItem[];
  barColor: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <li key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-gray-700">
                {item.rank !== undefined && (
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 tabular-nums">
                    {item.rank}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                {item.value.toLocaleString('es')}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${barColor} transition-[width] duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyHint() {
  return (
    <p className="text-sm text-gray-500">
      Todavía no hay datos suficientes.
    </p>
  );
}

const FUNNEL_TONES: Record<string, { border: string; value: string; dot: string; label: string }> = {
  slate: { border: 'border-slate-200', value: 'text-slate-900', dot: 'bg-slate-400', label: 'text-slate-600' },
  blue: { border: 'border-blue-200', value: 'text-blue-900', dot: 'bg-blue-500', label: 'text-blue-700' },
  emerald: { border: 'border-emerald-200', value: 'text-emerald-900', dot: 'bg-emerald-500', label: 'text-emerald-700' },
};

function FunnelStage({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: 'slate' | 'blue' | 'emerald';
  hint?: string;
}) {
  const t = FUNNEL_TONES[tone];
  return (
    <div className={`rounded-xl border ${t.border} bg-white px-4 py-3 flex flex-col justify-center`}>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
        <span className={`text-[11px] font-medium uppercase tracking-wider ${t.label}`}>{label}</span>
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${t.value}`}>
        {value.toLocaleString('es')}
      </div>
      {hint && <div className="mt-0.5 text-[10px] text-gray-400 tabular-nums">{hint}</div>}
    </div>
  );
}

function FunnelArrow({ percent }: { percent: number }) {
  return (
    <div className="hidden sm:flex flex-col items-center justify-center gap-1.5">
      <svg width="44" height="18" viewBox="0 0 44 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <path d="M2 9h36M32 3l6 6-6 6" />
      </svg>
      <div className="text-sm font-semibold tabular-nums text-gray-700">
        {percent.toFixed(1)}%
      </div>
    </div>
  );
}
