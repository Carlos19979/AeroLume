'use client';

import { useState } from 'react';

type TenantOption = { id: string; name: string };

type EventRow = {
  id: string;
  eventType: string;
  boatModel: string | null;
  tenantId: string;
  tenantName: string | null;
  createdAt: Date | null;
};

type QuoteRow = {
  id: string;
  boatModel: string | null;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  tenantId: string;
  tenantName: string | null;
  createdAt: Date | null;
};

const EVENT_LABELS: Record<string, string> = {
  configurator_opened: 'Configurador abierto',
  boat_selected: 'Barco seleccionado',
  product_selected: 'Producto seleccionado',
  quote_created: 'Presupuesto creado',
};

export function LogsClient({ tenants, events, quotes }: {
  tenants: TenantOption[];
  events: EventRow[];
  quotes: QuoteRow[];
}) {
  const [selectedTenant, setSelectedTenant] = useState<string>('all');

  const filteredEvents = selectedTenant === 'all'
    ? events
    : events.filter((e) => e.tenantId === selectedTenant);

  const filteredQuotes = selectedTenant === 'all'
    ? quotes
    : quotes.filter((q) => q.tenantId === selectedTenant);

  return (
    <>
      {/* Tenant filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500">Filtrar por tenant:</label>
        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
        >
          <option value="all">Todos los tenants</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {selectedTenant !== 'all' && (
          <button
            onClick={() => setSelectedTenant('all')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{filteredQuotes.length}</p>
          <p className="text-xs text-gray-400 mt-1">Quotes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
          <p className="text-xs text-gray-400 mt-1">Eventos widget</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">
            {filteredEvents.filter((e) => e.eventType === 'quote_created').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Conversiones</p>
        </div>
      </div>

      {/* Quotes */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Quotes recientes</h3>
          <span className="text-xs text-gray-400">{filteredQuotes.length} resultados</span>
        </div>
        {filteredQuotes.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin quotes para este filtro.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left px-5 py-2">Cliente</th>
                <th className="text-left px-5 py-2">Email</th>
                <th className="text-left px-5 py-2">Barco</th>
                <th className="text-left px-5 py-2">Estado</th>
                {selectedTenant === 'all' && <th className="text-left px-5 py-2">Tenant</th>}
                <th className="text-left px-5 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 text-gray-600">{q.customerName || '—'}</td>
                  <td className="px-5 py-2.5 text-gray-400">{q.customerEmail || '—'}</td>
                  <td className="px-5 py-2.5 text-gray-400">{q.boatModel || '—'}</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded ${
                      q.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      q.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{q.status}</span>
                  </td>
                  {selectedTenant === 'all' && (
                    <td className="px-5 py-2.5">
                      <a href={`/admin/tenants/${q.tenantId}`} className="text-blue-600 hover:text-blue-500 font-medium">
                        {q.tenantName || q.tenantId.slice(0, 8)}
                      </a>
                    </td>
                  )}
                  <td className="px-5 py-2.5 text-gray-300">{q.createdAt ? new Date(q.createdAt).toLocaleString('es') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Events */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Eventos del widget</h3>
          <span className="text-xs text-gray-400">{filteredEvents.length} resultados</span>
        </div>
        {filteredEvents.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin eventos para este filtro.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 sticky top-0 bg-white">
                  <th className="text-left px-5 py-2">Evento</th>
                  <th className="text-left px-5 py-2">Barco</th>
                  {selectedTenant === 'all' && <th className="text-left px-5 py-2">Tenant</th>}
                  <th className="text-left px-5 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-2 text-gray-600">
                      {EVENT_LABELS[e.eventType] || e.eventType}
                    </td>
                    <td className="px-5 py-2 text-gray-400">{e.boatModel || '—'}</td>
                    {selectedTenant === 'all' && (
                      <td className="px-5 py-2">
                        <a href={`/admin/tenants/${e.tenantId}`} className="text-blue-600 hover:text-blue-500 font-medium">
                          {e.tenantName || e.tenantId.slice(0, 8)}
                        </a>
                      </td>
                    )}
                    <td className="px-5 py-2 text-gray-300">{e.createdAt ? new Date(e.createdAt).toLocaleString('es') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
