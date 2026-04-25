'use client';

import { useState } from 'react';
import { SAIL_TYPE_LABELS, QUOTE_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/format';

type Quote = {
  id: string;
  boatModel: string | null;
  boatLength: string | null;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerNotes: string | null;
  totalPrice: string | null;
  currency: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  [key: string]: unknown;
};

type QuoteItem = {
  id: string;
  sailType: string;
  productName: string;
  sailArea: string | null;
  quantity: number | null;
  unitPrice: string | null;
  cost: string | null;
  configuration: unknown;
  sortOrder: number | null;
  [key: string]: unknown;
};

function formatPrice(value: string | number | null | undefined, currency: string) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!isFinite(n)) return '—';
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
}

const SAIL_TYPE_GROUPS: Record<string, 'main' | 'head' | 'downwind'> = {
  gvstd: 'main', gvfull: 'main', gve: 'main',
  gse: 'head', gn: 'head',
  gen: 'downwind', spiasy: 'downwind', spisym: 'downwind', furling: 'downwind',
};

const GROUP_STYLES: Record<string, { chip: string; dot: string; label: string }> = {
  main: { chip: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100', dot: 'bg-[var(--color-accent)]', label: 'Mayor' },
  head: { chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', dot: 'bg-emerald-500', label: 'Proa' },
  downwind: { chip: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100', dot: 'bg-violet-500', label: 'Empopada' },
};

const STATUS_STEPS = [
  { key: 'draft', label: 'Borrador' },
  { key: 'sent', label: 'Enviado' },
  { key: 'accepted', label: 'Aceptado' },
];

export function QuoteDetailClient({ quote: initialQuote, items }: { quote: Quote; items: QuoteItem[] }) {
  const [quote, setQuote] = useState(initialQuote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cur = quote.currency || 'EUR';
  const status = QUOTE_STATUS_LABELS[quote.status] || QUOTE_STATUS_LABELS.draft;

  const sortedItems = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const totalFromItems = sortedItems.reduce((sum, item) => {
    return sum + (item.unitPrice ? Number(item.unitPrice) : 0) * (item.quantity || 1);
  }, 0);
  const totalCost = sortedItems.reduce((sum, item) => {
    return sum + (item.cost ? Number(item.cost) : 0) * (item.quantity || 1);
  }, 0);
  const margin = totalFromItems > 0 && totalCost > 0 ? totalFromItems - totalCost : null;
  const marginPct = margin !== null && totalFromItems > 0 ? (margin / totalFromItems) * 100 : null;
  const displayTotal = quote.totalPrice ? Number(quote.totalPrice) : totalFromItems || null;

  async function updateStatus(newStatus: string) {
    setSaving(true);
    try {
      setError(null);
      const res = await fetch(`/api/internal/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      if (data) setQuote(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Main content ── */}
      <div className="lg:col-span-2 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Document header */}
        <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-navy)]" />
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  <span>Presupuesto</span>
                  <span className="text-gray-300">·</span>
                  <span className="font-mono text-gray-400 normal-case tracking-normal">#{quote.id.slice(0, 8)}</span>
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                  {quote.customerName || 'Cliente sin nombre'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {quote.boatModel ? (
                    <>Barco <span className="font-medium text-gray-700">{quote.boatModel}</span>{quote.boatLength && <> · eslora <span className="tabular-nums font-medium text-gray-700">{quote.boatLength} m</span></>}</>
                  ) : (
                    'Barco sin especificar'
                  )}
                </p>
              </div>
              <span
                data-testid={`quote-status-${quote.id}`}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {status.label}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Total</p>
                <p data-testid="quote-total" className="mt-1 text-3xl font-semibold text-gray-900 tabular-nums">
                  {displayTotal ? formatPrice(displayTotal, cur) : <span className="text-gray-400 text-xl">Pendiente</span>}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Artículos</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 tabular-nums">
                  {sortedItems.length}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {sortedItems.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Creado</p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {quote.createdAt ? formatDate(quote.createdAt) : '—'}
                </p>
                {quote.updatedAt && (
                  <p className="text-xs text-gray-400 mt-0.5">Actualizado {formatDate(quote.updatedAt)}</p>
                )}
              </div>
            </div>

            {/* Progress */}
            <StatusTrack status={quote.status} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-baseline justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Productos solicitados</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configuración elegida por el cliente en el widget
              </p>
            </div>
            {totalFromItems > 0 && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-400 font-semibold">Subtotal</p>
                <p className="text-base font-semibold text-gray-900 tabular-nums">{formatPrice(totalFromItems, cur)}</p>
              </div>
            )}
          </div>
          {sortedItems.length === 0 ? (
            <p className="text-sm text-gray-500 p-8 text-center">Sin productos.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sortedItems.map((item) => {
                const cfg = item.configuration as Record<string, string> | null;
                const entries = cfg && typeof cfg === 'object' ? Object.entries(cfg).filter(([, v]) => v) : [];
                const group = SAIL_TYPE_GROUPS[item.sailType];
                const gs = group ? GROUP_STYLES[group] : null;
                const qty = item.quantity || 1;
                const lineTotal = item.unitPrice ? Number(item.unitPrice) * qty : null;
                return (
                  <li key={item.id} data-testid={`quote-item-${item.id}`} className="p-6 hover:bg-gray-50/40 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center ${gs?.chip ?? 'bg-gray-50 text-gray-600 ring-1 ring-gray-100'}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3v18" />
                          <path d="M12 3c-4 3-7 8-7 13h7" fill="currentColor" fillOpacity="0.12" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
                              {gs && (
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${gs.chip} font-medium`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${gs.dot}`} />
                                  {gs.label}
                                </span>
                              )}
                              <span className="text-gray-500">{SAIL_TYPE_LABELS[item.sailType] || item.sailType}</span>
                              {item.sailArea && (
                                <span className="text-gray-400">
                                  <span className="tabular-nums">{Number(item.sailArea).toFixed(1)}</span> m²
                                </span>
                              )}
                              {qty > 1 && (
                                <span className="text-gray-400">× <span className="tabular-nums">{qty}</span></span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {item.unitPrice ? (
                              <>
                                <p className="text-lg font-semibold text-gray-900 tabular-nums">
                                  {formatPrice(lineTotal, cur)}
                                </p>
                                {qty > 1 && (
                                  <p className="text-[11px] text-gray-400 tabular-nums">
                                    {formatPrice(item.unitPrice, cur)} / ud.
                                  </p>
                                )}
                                {item.cost && (
                                  <p className="text-[11px] text-gray-400 tabular-nums mt-0.5">
                                    Coste {formatPrice(Number(item.cost) * qty, cur)}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">Sin precio</p>
                            )}
                          </div>
                        </div>
                        {entries.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {entries.map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-md px-2 py-1 text-xs"
                              >
                                <span className="text-gray-400 font-medium">{key}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-700">{value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Margin analysis */}
        {margin !== null && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Análisis de margen</h3>
              <span className="text-[11px] text-gray-400">Visible solo para tu equipo</span>
            </div>

            {/* Stacked bar */}
            <div className="flex h-10 rounded-lg overflow-hidden ring-1 ring-gray-100 bg-gray-50">
              <div
                className="bg-gray-700/90 flex items-center justify-start px-3 transition-[width] duration-500"
                style={{ width: totalFromItems > 0 ? `${(totalCost / totalFromItems) * 100}%` : '0%' }}
              >
                <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Coste</span>
              </div>
              <div
                className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dim,#1a7fd4)] flex items-center justify-end px-3 flex-1 transition-[width] duration-500"
              >
                <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                  {marginPct !== null ? `${marginPct.toFixed(1)}% margen` : 'Margen'}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">PVP</p>
                <p data-testid="quote-margin-pvp" className="text-lg font-semibold text-gray-900 tabular-nums mt-1">{formatPrice(totalFromItems, cur)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Coste</p>
                <p data-testid="quote-margin-cost" className="text-lg font-semibold text-gray-700 tabular-nums mt-1">{formatPrice(totalCost, cur)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Margen</p>
                <p data-testid="quote-margin-result" className="text-lg font-semibold tabular-nums mt-1" style={{ color: 'var(--color-accent)' }}>
                  {formatPrice(margin, cur)}
                  {marginPct !== null && (
                    <span data-testid="quote-margin-percent" className="text-xs font-medium text-gray-400 ml-1.5 tabular-nums">({marginPct.toFixed(1)}%)</span>
                  )}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
              Coste calculado desde tu catálogo al crear el presupuesto.
            </p>
          </div>
        )}

        {/* Customer notes */}
        {quote.customerNotes && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Notas del cliente</h3>
            <div className="relative pl-4 border-l-2 border-[var(--color-accent)]/30">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                {quote.customerNotes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <div className="space-y-4">

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
          <div className="space-y-2">
            {quote.status === 'draft' && (
              <button
                data-testid="quote-action-send"
                onClick={() => updateStatus('sent')}
                disabled={saving}
                className="w-full px-4 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-accent-dim,#1a7fd4)] disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Marcar como enviado
              </button>
            )}
            {quote.status === 'sent' && (
              <>
                <button
                  data-testid="quote-action-accept"
                  onClick={() => updateStatus('accepted')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Aceptar presupuesto
                </button>
                <button
                  data-testid="quote-action-reject"
                  onClick={() => updateStatus('rejected')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Rechazar
                </button>
              </>
            )}
            {(quote.status === 'accepted' || quote.status === 'rejected') && (
              <button
                data-testid="quote-action-draft"
                onClick={() => updateStatus('draft')}
                disabled={saving}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Volver a borrador
              </button>
            )}
            {quote.customerEmail && (
              <a
                href={`mailto:${quote.customerEmail}?subject=Presupuesto%20${quote.id.slice(0, 8)}`}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                Escribir al cliente
              </a>
            )}
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Cliente</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)]/15 to-[var(--color-accent)]/5 ring-1 ring-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                {(quote.customerName || '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{quote.customerName || 'Sin nombre'}</p>
              <p className="text-[11px] text-gray-400">Cliente del configurador</p>
            </div>
          </div>
          <dl className="space-y-2.5 text-sm">
            {quote.customerEmail && (
              <div className="flex items-start gap-2">
                <dt className="w-14 shrink-0 text-[11px] uppercase tracking-wider text-gray-400 font-semibold pt-0.5">Email</dt>
                <dd className="text-gray-700 break-all">
                  <a href={`mailto:${quote.customerEmail}`} className="hover:text-[var(--color-accent)] hover:underline">
                    {quote.customerEmail}
                  </a>
                </dd>
              </div>
            )}
            {quote.customerPhone && (
              <div className="flex items-start gap-2">
                <dt className="w-14 shrink-0 text-[11px] uppercase tracking-wider text-gray-400 font-semibold pt-0.5">Tel.</dt>
                <dd className="text-gray-700 tabular-nums">
                  <a href={`tel:${quote.customerPhone}`} className="hover:text-[var(--color-accent)] hover:underline">
                    {quote.customerPhone}
                  </a>
                </dd>
              </div>
            )}
            {!quote.customerEmail && !quote.customerPhone && (
              <p className="text-xs text-gray-400">Sin datos de contacto.</p>
            )}
          </dl>
        </div>

        {/* Boat */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Barco</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b5faa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18c2 2 6 2 9 0s7-2 9 0" />
                <path d="M5 15l1-6h12l1 6" fill="rgba(11,95,170,0.08)" />
                <path d="M12 3v6" />
                <path d="M12 3l-4 6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{quote.boatModel || 'Sin especificar'}</p>
              {quote.boatLength && (
                <p className="text-xs text-gray-500 tabular-nums">Eslora {quote.boatLength} m</p>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Creado</dt>
              <dd className="text-gray-700 font-medium tabular-nums">
                {quote.createdAt ? formatDateTime(quote.createdAt) : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Actualizado</dt>
              <dd className="text-gray-700 font-medium tabular-nums">
                {quote.updatedAt ? formatDateTime(quote.updatedAt) : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Moneda</dt>
              <dd className="text-gray-700 font-medium">{cur}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">ID</dt>
              <dd className="font-mono text-[11px] text-gray-500">{quote.id.slice(0, 8)}…</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function StatusTrack({ status }: { status: string }) {
  // Determine active index; handle 'rejected' and 'expired' as terminal branches.
  const isRejected = status === 'rejected';
  const isExpired = status === 'expired';
  const activeIdx = status === 'accepted' ? 2 : status === 'sent' ? 1 : 0;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center gap-2">
        {STATUS_STEPS.map((step, i) => {
          const reached = i <= activeIdx && !isRejected && !isExpired;
          const current = i === activeIdx && !isRejected && !isExpired;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
                    reached
                      ? 'bg-[var(--color-accent)] text-white'
                      : current
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {reached && i < activeIdx ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={`text-xs font-medium ${reached ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-3 ${i < activeIdx && !isRejected && !isExpired ? 'bg-[var(--color-accent)]/50' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      {(isRejected || isExpired) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span className={`w-1.5 h-1.5 rounded-full ${isRejected ? 'bg-red-500' : 'bg-amber-500'}`} />
          {isRejected ? 'El cliente ha rechazado el presupuesto.' : 'El presupuesto ha expirado.'}
        </div>
      )}
    </div>
  );
}
