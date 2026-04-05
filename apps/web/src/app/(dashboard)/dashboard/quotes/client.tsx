'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUOTE_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

type QuoteRow = {
  id: string;
  boatModel: string | null;
  boatLength: string | null;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  totalPrice: string | null;
  currency: string | null;
  createdAt: Date | null;
};

export function QuotesClient({ initialQuotes }: { initialQuotes: QuoteRow[] }) {
  const [quotesList, setQuotesList] = useState(initialQuotes);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const filtered = filter === 'all'
    ? quotesList
    : quotesList.filter((q) => q.status === filter);

  async function handleUpdateStatus(id: string, status: string) {
    try {
      setError(null);
      const res = await fetch(`/api/internal/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setQuotesList((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status } : q))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/internal/quotes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setQuotesList((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'draft', label: 'Borradores' },
          { value: 'sent', label: 'Enviados' },
          { value: 'accepted', label: 'Aceptados' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              filter === f.value
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1 opacity-70">
                ({quotesList.filter((q) => q.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {filter === 'all'
              ? 'No hay presupuestos todavía. Llegarán cuando los clientes usen el configurador.'
              : 'No hay presupuestos con este estado.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Barco</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((quote) => {
                const status = QUOTE_STATUS_LABELS[quote.status] || QUOTE_STATUS_LABELS.draft;
                return (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">
                        {quote.customerName || 'Sin nombre'}
                      </div>
                      {quote.customerEmail && (
                        <div className="text-xs text-gray-500">{quote.customerEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {quote.boatModel || '—'}
                      {quote.boatLength && (
                        <span className="text-gray-500 ml-1">({quote.boatLength}m)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {quote.totalPrice
                        ? `${Number(quote.totalPrice).toFixed(0)} ${quote.currency || 'EUR'}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {quote.createdAt
                        ? formatDate(quote.createdAt)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quote.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'sent')}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            Enviar
                          </button>
                        )}
                        {quote.status === 'sent' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'accepted')}
                              className="text-green-500 hover:text-green-700 text-xs"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                          className="text-[var(--color-accent)] hover:underline text-xs"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: quotesList.length, color: 'text-gray-900' },
          { label: 'Borradores', count: quotesList.filter((q) => q.status === 'draft').length, color: 'text-gray-500' },
          { label: 'Enviados', count: quotesList.filter((q) => q.status === 'sent').length, color: 'text-blue-600' },
          { label: 'Aceptados', count: quotesList.filter((q) => q.status === 'accepted').length, color: 'text-green-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-semibold ${stat.color}`}>{stat.count}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
