'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAIL_TYPE_LABELS, QUOTE_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

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
  [key: string]: any;
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
  [key: string]: any;
};

function formatPrice(value: string | number | null, currency: string) {
  if (!value) return '—';
  return `${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
}

export function QuoteDetailClient({ quote: initialQuote, items }: { quote: Quote; items: QuoteItem[] }) {
  const [quote, setQuote] = useState(initialQuote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cur = quote.currency || 'EUR';
  const status = QUOTE_STATUS_LABELS[quote.status] || QUOTE_STATUS_LABELS.draft;

  const totalFromItems = items.reduce((sum, item) => {
    return sum + (item.unitPrice ? Number(item.unitPrice) : 0) * (item.quantity || 1);
  }, 0);
  const totalCost = items.reduce((sum, item) => {
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

        {/* Price summary card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2540, #0b5faa)' }}>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Total presupuesto</p>
              <p className="text-3xl font-bold text-white mt-1 font-[family-name:var(--font-cormorant)]">
                {displayTotal ? formatPrice(displayTotal, cur) : 'Pendiente'}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                {status.label}
              </span>
              {quote.boatModel && (
                <p className="text-sm text-white/40 mt-2">{quote.boatModel} {quote.boatLength ? `· ${quote.boatLength}m` : ''}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Productos solicitados</h3>
            <p className="text-xs text-gray-500 mt-0.5">{items.length} {items.length === 1 ? 'producto' : 'productos'} en este presupuesto</p>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 p-6">Sin productos.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {items
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((item) => {
                  const cfg = item.configuration as Record<string, string> | null;
                  const entries = cfg && typeof cfg === 'object' ? Object.entries(cfg).filter(([, v]) => v) : [];
                  return (
                    <div key={item.id} data-testid={`quote-item-${item.id}`} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {SAIL_TYPE_LABELS[item.sailType] || item.sailType}
                            {item.sailArea && <span className="ml-2">· {Number(item.sailArea).toFixed(1)} m²</span>}
                            {item.quantity && item.quantity > 1 && <span className="ml-2">· x{item.quantity}</span>}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          {item.unitPrice ? (
                            <p className="text-lg font-bold" style={{ color: '#0b5faa' }}>
                              {formatPrice(item.unitPrice, cur)}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Sin precio</p>
                          )}
                          {item.cost && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Coste: {formatPrice(item.cost, cur)}
                            </p>
                          )}
                        </div>
                      </div>
                      {entries.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {entries.map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">{key}</p>
                              <p className="text-xs font-medium text-gray-700 mt-0.5">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
          {/* Items total */}
          {totalFromItems > 0 && items.length > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(totalFromItems, cur)}</span>
            </div>
          )}
        </div>

        {/* Margin analysis (tenant-only) */}
        {margin !== null && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Análisis de margen</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">PVP</p>
                <p data-testid="quote-margin-pvp" className="text-lg font-bold text-gray-900 mt-1">{formatPrice(totalFromItems, cur)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Coste</p>
                <p data-testid="quote-margin-cost" className="text-lg font-bold text-gray-700 mt-1">{formatPrice(totalCost, cur)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Margen</p>
                <p data-testid="quote-margin-result" className="text-lg font-bold mt-1" style={{ color: '#0b5faa' }}>
                  {formatPrice(margin, cur)}
                  {marginPct !== null && (
                    <span data-testid="quote-margin-percent" className="text-xs font-medium text-gray-400 ml-1.5">({marginPct.toFixed(1)}%)</span>
                  )}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              Coste calculado desde tu catálogo al crear el presupuesto. Solo visible para tu equipo.
            </p>
          </div>
        )}

        {/* Customer notes */}
        {quote.customerNotes && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Notas del cliente</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{quote.customerNotes}</p>
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
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Marcar como enviado
              </button>
            )}
            {quote.status === 'sent' && (
              <>
                <button
                  data-testid="quote-action-accept"
                  onClick={() => updateStatus('accepted')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Aceptar presupuesto
                </button>
                <button
                  data-testid="quote-action-reject"
                  onClick={() => updateStatus('rejected')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
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
          </div>
        </div>

        {/* Client */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Cliente</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#0b5faa]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold" style={{ color: '#0b5faa' }}>
                {(quote.customerName || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{quote.customerName || 'Sin nombre'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {quote.customerPhone && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-gray-500">Tel:</span>
                <span>{quote.customerPhone}</span>
              </div>
            )}
            {quote.customerEmail && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-gray-500">Email:</span>
                <span>{quote.customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Boat */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Barco</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L4 20h16L12 2z" opacity="0.2" fill="#3b82f6" />
                <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{quote.boatModel || 'Sin especificar'}</p>
              {quote.boatLength && <p className="text-xs text-gray-500">Eslora: {quote.boatLength}m</p>}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Creado</dt>
              <dd className="text-gray-700 font-medium">
                {quote.createdAt ? formatDate(quote.createdAt) : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Actualizado</dt>
              <dd className="text-gray-700 font-medium">
                {quote.updatedAt ? formatDate(quote.updatedAt) : '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">ID</dt>
              <dd className="font-mono text-[10px] text-gray-500">{quote.id.slice(0, 8)}...</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
