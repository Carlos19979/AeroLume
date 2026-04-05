'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Building2 } from 'lucide-react';

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

const EVENT_COLORS: Record<string, string> = {
  configurator_opened: 'bg-gray-100 text-gray-600',
  boat_selected: 'bg-blue-50 text-blue-600',
  product_selected: 'bg-violet-50 text-violet-600',
  quote_created: 'bg-green-50 text-green-600',
};

function TenantSearch({ tenants, selected, onSelect }: {
  tenants: TenantOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query.length >= 1
    ? tenants.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : tenants;

  const selectedName = selected === 'all' ? null : tenants.find((t) => t.id === selected)?.name;

  return (
    <div ref={ref} className="relative">
      {selectedName ? (
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white">
          <Building2 size={14} className="text-[var(--color-accent)] shrink-0" />
          <span className="text-sm font-medium text-gray-700">{selectedName}</span>
          <button onClick={() => { onSelect('all'); setQuery(''); }} className="ml-auto text-gray-300 hover:text-gray-500">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar tenant..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]/30"
          />
        </div>
      )}

      {open && !selectedName && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
          <button
            onClick={() => { onSelect('all'); setOpen(false); setQuery(''); }}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selected === 'all' ? 'text-[var(--color-accent)] font-medium' : 'text-gray-500'}`}
          >
            Todos los tenants
          </button>
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => { onSelect(t.id); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${selected === t.id ? 'text-[var(--color-accent)] font-medium' : 'text-gray-700'}`}
            >
              <Building2 size={12} className="text-gray-300 shrink-0" />
              {t.name}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400">No se encontraron tenants</p>
          )}
        </div>
      )}
    </div>
  );
}

export function LogsClient({ tenants, events, quotes }: {
  tenants: TenantOption[];
  events: EventRow[];
  quotes: QuoteRow[];
}) {
  const [selectedTenant, setSelectedTenant] = useState<string>('all');

  const filteredEvents = selectedTenant === 'all' ? events : events.filter((e) => e.tenantId === selectedTenant);
  const filteredQuotes = selectedTenant === 'all' ? quotes : quotes.filter((q) => q.tenantId === selectedTenant);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="max-w-sm">
        <TenantSearch tenants={tenants} selected={selectedTenant} onSelect={setSelectedTenant} />
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
      <div className="rounded-2xl bg-white border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Quotes recientes</h3>
          <span className="text-xs text-gray-400">{filteredQuotes.length} resultados</span>
        </div>
        {filteredQuotes.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Sin quotes para este filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Barco</th>
                  <th className="text-left px-5 py-3 font-medium">Estado</th>
                  {selectedTenant === 'all' && <th className="text-left px-5 py-3 font-medium">Tenant</th>}
                  <th className="text-left px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q, i) => (
                  <tr key={q.id} className={`hover:bg-gray-50 transition-colors ${i < filteredQuotes.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <td className="px-5 py-3 text-gray-700 font-medium">{q.customerName || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{q.customerEmail || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{q.boatModel || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        q.status === 'accepted' ? 'bg-green-50 text-green-600' :
                        q.status === 'sent' ? 'bg-blue-50 text-blue-600' :
                        q.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{q.status}</span>
                    </td>
                    {selectedTenant === 'all' && (
                      <td className="px-5 py-3">
                        <a href={`/admin/tenants/${q.tenantId}`} className="text-[var(--color-accent)] hover:underline font-medium">
                          {q.tenantName || q.tenantId.slice(0, 8)}
                        </a>
                      </td>
                    )}
                    <td className="px-5 py-3 text-gray-400">{q.createdAt ? new Date(q.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Events */}
      <div className="rounded-2xl bg-white border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Eventos del widget</h3>
          <span className="text-xs text-gray-400">{filteredEvents.length} resultados</span>
        </div>
        {filteredEvents.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Sin eventos para este filtro.</p>
        ) : (
          <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Evento</th>
                  <th className="text-left px-5 py-3 font-medium">Barco</th>
                  {selectedTenant === 'all' && <th className="text-left px-5 py-3 font-medium">Tenant</th>}
                  <th className="text-left px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e, i) => (
                  <tr key={e.id} className={`hover:bg-gray-50 transition-colors ${i < filteredEvents.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <td className="px-5 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${EVENT_COLORS[e.eventType] || 'bg-gray-100 text-gray-500'}`}>
                        {EVENT_LABELS[e.eventType] || e.eventType}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-gray-500">{e.boatModel || '—'}</td>
                    {selectedTenant === 'all' && (
                      <td className="px-5 py-2.5">
                        <a href={`/admin/tenants/${e.tenantId}`} className="text-[var(--color-accent)] hover:underline font-medium">
                          {e.tenantName || e.tenantId.slice(0, 8)}
                        </a>
                      </td>
                    )}
                    <td className="px-5 py-2.5 text-gray-400">{e.createdAt ? new Date(e.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
