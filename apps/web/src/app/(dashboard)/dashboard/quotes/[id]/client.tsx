'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviado', color: 'bg-blue-50 text-blue-700' },
  accepted: { label: 'Aceptado', color: 'bg-green-50 text-green-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-50 text-red-600' },
  expired: { label: 'Expirado', color: 'bg-yellow-50 text-yellow-700' },
};

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
  configuration: unknown;
  sortOrder: number | null;
  [key: string]: any;
};

export function QuoteDetailClient({ quote: initialQuote, items }: { quote: Quote; items: QuoteItem[] }) {
  const [quote, setQuote] = useState(initialQuote);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function updateStatus(status: string) {
    setSaving(true);
    const res = await fetch(`/api/internal/quotes/${quote.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const { data } = await res.json();
    if (data) setQuote(data);
    setSaving(false);
  }

  const status = STATUS_LABELS[quote.status] || STATUS_LABELS.draft;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Productos solicitados</h3>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">Sin productos.</p>
          ) : (
            <div className="space-y-3">
              {items
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{item.productName}</span>
                        <span className="text-xs text-gray-400 ml-2">({item.sailType})</span>
                      </div>
                      {item.unitPrice && (
                        <span className="font-semibold text-[var(--color-accent)]">
                          {Number(item.unitPrice).toFixed(0)} {quote.currency || 'EUR'}
                        </span>
                      )}
                    </div>
                    {item.sailArea && (
                      <p className="text-xs text-gray-500 mt-1">
                        Superficie: {item.sailArea} m²
                      </p>
                    )}
                    {(() => {
                      const cfg = item.configuration as Record<string, string> | null;
                      if (!cfg || typeof cfg !== 'object') return null;
                      const entries = Object.entries(cfg);
                      if (entries.length === 0) return null;
                      return (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {entries.map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Customer notes */}
        {quote.customerNotes && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-2">Notas del cliente</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.customerNotes}</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Estado</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
          <div className="mt-4 space-y-2">
            {quote.status === 'draft' && (
              <button
                onClick={() => updateStatus('sent')}
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Marcar como enviado
              </button>
            )}
            {quote.status === 'sent' && (
              <>
                <button
                  onClick={() => updateStatus('accepted')}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Rechazar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Client info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Cliente</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Nombre</dt>
              <dd className="text-gray-900">{quote.customerName || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{quote.customerEmail || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Teléfono</dt>
              <dd className="text-gray-900">{quote.customerPhone || '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Boat info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Barco</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Modelo</dt>
              <dd className="text-gray-900">{quote.boatModel || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Eslora</dt>
              <dd className="text-gray-900">{quote.boatLength ? `${quote.boatLength}m` : '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Detalles</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Creado</dt>
              <dd className="text-gray-900">
                {quote.createdAt ? new Date(quote.createdAt).toLocaleString('es') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Actualizado</dt>
              <dd className="text-gray-900">
                {quote.updatedAt ? new Date(quote.updatedAt).toLocaleString('es') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">ID</dt>
              <dd className="font-mono text-xs text-gray-400">{quote.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
