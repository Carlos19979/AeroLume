'use client';

import { useState, useEffect, useDeferredValue } from 'react';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  themeAccent: string | null;
  locale: string | null;
  currency: string | null;
};

type Boat = {
  id: string;
  model: string;
  boatModel: string | null;
  length: string | null;
  [key: string]: any;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sailType: string;
  basePrice: string | null;
  currency: string | null;
  descriptionShort: string | null;
  configFields: ConfigField[];
};

type ConfigField = {
  id: string;
  key: string;
  label: string;
  fieldType: string | null;
  options: string[];
  sortOrder: number | null;
  required: boolean | null;
  priceModifiers: Record<string, number> | null;
};

type Step = 'boat' | 'products' | 'configure' | 'contact' | 'done';

type SailGroup = 'main' | 'head' | 'spi';

const SAIL_GROUPS: Record<SailGroup, { label: string; icon: string; types: string[] }> = {
  main: { label: 'Vela mayor', icon: '⛵', types: ['gvstd', 'gvfull', 'gve'] },
  head: { label: 'Vela de proa', icon: '🔺', types: ['gse', 'gn'] },
  spi: { label: 'Portantes', icon: '🪂', types: ['spiasy', 'spisym', 'furling', 'gen'] },
};

const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clasica',
  gvfull: 'Mayor Full Batten',
  gve: 'Mayor Enrollable',
  gse: 'Genova Enrollable',
  gn: 'Genova Mosquetones',
  gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simetrico',
  spiasy: 'Spinnaker Asimetrico',
  furling: 'Code S',
};

const STEPS: { key: Step; label: string; num: number }[] = [
  { key: 'boat', label: 'Barco', num: 1 },
  { key: 'products', label: 'Vela', num: 2 },
  { key: 'configure', label: 'Opciones', num: 3 },
  { key: 'contact', label: 'Contacto', num: 4 },
];

function stepIndex(s: Step): number {
  if (s === 'done') return 4;
  return STEPS.findIndex((st) => st.key === s);
}

export function EmbedConfigurator({ apiKey, tenant }: { apiKey: string; tenant: Tenant }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [boatResults, setBoatResults] = useState<Boat[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>('boat');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const accent = tenant.themeAccent || '#0b5faa';
  const headers = { 'x-api-key': apiKey };

  function getBoatSailArea(boat: Boat | null, sailType: string): number | null {
    if (!boat) return null;
    const val = boat[sailType];
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  function calculatePrice(): { base: number; extras: { label: string; amount: number }[]; total: number } | null {
    if (!selectedProduct || !selectedBoat) return null;
    const area = getBoatSailArea(selectedBoat, selectedProduct.sailType);
    const pricePerSqm = Number(selectedProduct.basePrice) || 0;
    if (!area || !pricePerSqm) return null;
    const base = area * pricePerSqm;
    const extras: { label: string; amount: number }[] = [];
    for (const field of selectedProduct.configFields) {
      const selectedOption = config[field.key];
      if (!selectedOption || !field.priceModifiers) continue;
      const mod = (field.priceModifiers as Record<string, number>)[selectedOption];
      if (mod && mod > 0) extras.push({ label: `${field.label}: ${selectedOption}`, amount: mod });
    }
    const total = base + extras.reduce((sum, e) => sum + e.amount, 0);
    return { base, extras, total };
  }

  const pricing = calculatePrice();
  const currency = selectedProduct?.currency || tenant.currency || 'EUR';

  function track(eventType: string, extra?: Record<string, any>) {
    fetch('/api/v1/analytics', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType, ...extra }) }).catch(() => {});
  }

  function goBack() {
    const order: Step[] = ['boat', 'products', 'configure', 'contact'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  useEffect(() => { track('configurator_opened'); }, []);

  useEffect(() => {
    const value = deferredQuery.trim();
    if (value.length < 2) { setBoatResults([]); return; }
    const controller = new AbortController();
    setSearchLoading(true);
    fetch(`/api/v1/boats/search?query=${encodeURIComponent(value)}`, { headers, signal: controller.signal })
      .then((r) => r.json()).then(({ data }) => setBoatResults(data || []))
      .catch((e) => e.name !== 'AbortError' && console.error(e))
      .finally(() => setSearchLoading(false));
    return () => controller.abort();
  }, [deferredQuery]);

  useEffect(() => {
    if (!selectedBoat) return;
    setProductsLoading(true);
    fetch('/api/v1/products', { headers }).then((r) => r.json())
      .then(({ data }) => { setProducts((data || []).filter((p: Product) => p.configFields)); setProductsLoading(false); })
      .catch(() => setProductsLoading(false));
  }, [selectedBoat]);

  function selectBoat(boat: Boat) {
    setSelectedBoat(boat); setQuery(boat.model); setBoatResults([]); setStep('products');
    track('boat_selected', { boatModel: boat.model });
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product); setConfig({}); setStep('configure');
    track('product_selected', { sailType: product.sailType, productId: product.id });
    postMsg('aerolume:product-selected', product);
  }

  function postMsg(type: string, payload: any) { window.parent.postMessage({ type, payload }, '*'); }

  useEffect(() => {
    const observer = new ResizeObserver(() => postMsg('aerolume:resize', { height: document.body.scrollHeight }));
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--navy, #0a2540)' }}>
          Configurador de Velas
        </h1>
        <p className="text-sm text-gray-400 mt-1">por {tenant.name}</p>
      </div>

      {/* Stepper */}
      {step !== 'done' && (
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const current = stepIndex(step);
            const done = i < current;
            const active = i === current;
            return (
              <div key={s.key} className="flex items-center">
                {i > 0 && (
                  <div className="w-8 sm:w-12 h-0.5 mx-1" style={{ backgroundColor: done ? accent : '#e5e7eb' }} />
                )}
                <button
                  onClick={() => {
                    if (done) setStep(s.key);
                  }}
                  disabled={!done && !active}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shrink-0"
                    style={
                      active
                        ? { backgroundColor: accent, color: '#fff', boxShadow: `0 0 0 4px ${accent}25` }
                        : done
                          ? { backgroundColor: accent, color: '#fff' }
                          : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {done ? '✓' : s.num}
                  </div>
                  <span className={`text-xs hidden sm:inline ${active ? 'font-semibold text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Back button */}
      {step !== 'boat' && step !== 'done' && (
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4L6 8L10 12" />
          </svg>
          Atras
        </button>
      )}

      {/* Context bar */}
      {step !== 'boat' && step !== 'done' && selectedBoat && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
            {selectedBoat.model}
            <span className="text-blue-400">{selectedBoat.length}m</span>
          </span>
          {selectedProduct && step !== 'products' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
              {selectedProduct.name}
              {(() => {
                const area = getBoatSailArea(selectedBoat, selectedProduct.sailType);
                return area ? <span className="text-emerald-400">{area.toFixed(1)} m²</span> : null;
              })()}
            </span>
          )}
        </div>
      )}

      {/* ═══════════════ STEP 1: BOAT ═══════════════ */}
      {step === 'boat' && (
        <div className="space-y-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Busca tu barco (ej: Bavaria 38, Beneteau 40...)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedBoat(null); }}
              className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
              style={{ '--tw-ring-color': accent } as React.CSSProperties}
            />
            {searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {boatResults.length > 0 && (
            <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 max-h-72 overflow-y-auto shadow-sm">
              {boatResults.map((boat) => (
                <button
                  key={boat.id}
                  onClick={() => selectBoat(boat)}
                  className="w-full text-left px-5 py-3.5 hover:bg-gray-50 text-sm transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="font-medium text-gray-900 group-hover:text-[var(--accent)]">{boat.model}</span>
                    {boat.length && <span className="text-gray-400 ml-2 text-xs">{boat.length}m</span>}
                  </div>
                  <svg className="text-gray-300 group-hover:text-[var(--accent)] transition-colors" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4L10 8L6 12" /></svg>
                </button>
              ))}
            </div>
          )}

          {!query && !selectedBoat && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⛵</div>
              <p className="text-sm text-gray-400">Empieza buscando el modelo de tu barco</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ STEP 2: PRODUCTS ═══════════════ */}
      {step === 'products' && (
        <div className="space-y-6">
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--accent)] rounded-full animate-spin mx-auto" style={{ borderTopColor: accent }} />
              <p className="text-sm text-gray-400 mt-3">Cargando productos...</p>
            </div>
          ) : (
            Object.entries(SAIL_GROUPS).map(([groupKey, group]) => {
              const groupProducts = products.filter((p) => group.types.includes(p.sailType));
              if (groupProducts.length === 0) return null;
              return (
                <div key={groupKey}>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
                    <span className="mr-1.5">{group.icon}</span>{group.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupProducts.map((product) => {
                      const area = getBoatSailArea(selectedBoat, product.sailType);
                      const pricePerSqm = Number(product.basePrice) || 0;
                      const estimatedPrice = area && pricePerSqm ? area * pricePerSqm : null;
                      return (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="text-left border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
                        >
                          <p className="font-medium text-gray-900 text-sm group-hover:text-[var(--accent)]">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{SAIL_TYPE_LABELS[product.sailType] || product.sailType}</p>
                          {area && <p className="text-xs text-gray-400 mt-0.5">{area.toFixed(1)} m² para tu barco</p>}
                          {estimatedPrice && (
                            <p className="text-base font-bold mt-3" style={{ color: accent }}>
                              desde {estimatedPrice.toFixed(0)} {product.currency || currency}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════════ STEP 3: CONFIGURE ═══════════════ */}
      {step === 'configure' && selectedProduct && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Configurar {selectedProduct.name}</h3>

            {selectedProduct.configFields
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((field) => {
                const mods = field.priceModifiers as Record<string, number> | null;
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {field.fieldType === 'select' && Array.isArray(field.options) ? (
                      <select
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                        style={{ '--tw-ring-color': accent } as React.CSSProperties}
                      >
                        <option value="">Seleccionar...</option>
                        {field.options.map((opt) => {
                          const mod = mods?.[opt];
                          const modLabel = mod && mod > 0 ? ` (+${mod} ${currency})` : '';
                          return <option key={opt} value={opt}>{opt}{modLabel}</option>;
                        })}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                        style={{ '--tw-ring-color': accent } as React.CSSProperties}
                      />
                    )}
                  </div>
                );
              })}

            {/* Price breakdown */}
            {pricing && (
              <div className="bg-gray-50 rounded-xl p-5 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{getBoatSailArea(selectedBoat, selectedProduct.sailType)?.toFixed(2)} m² x {Number(selectedProduct.basePrice).toFixed(0)} {currency}/m²</span>
                  <span>{pricing.base.toFixed(0)} {currency}</span>
                </div>
                {pricing.extras.map((extra, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-400">
                    <span>{extra.label}</span>
                    <span>+{extra.amount} {currency}</span>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200" style={{ color: accent }}>
                  <span>Total estimado</span>
                  <span>{pricing.total.toFixed(0)} {currency}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('contact')}
              className="w-full py-3.5 text-white text-sm rounded-xl font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: accent }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 4: CONTACT ═══════════════ */}
      {step === 'contact' && selectedProduct && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900">Datos de contacto</h3>
              <p className="text-sm text-gray-400 mt-1">Para enviarte el presupuesto detallado.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre *</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': accent } as React.CSSProperties}
                placeholder="Tu nombre" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email *</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': accent } as React.CSSProperties}
                placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Telefono</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': accent } as React.CSSProperties}
                placeholder="+34 600 000 000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Notas</label>
              <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow resize-none"
                style={{ '--tw-ring-color': accent } as React.CSSProperties}
                placeholder="Cualquier detalle adicional..." />
            </div>

            {/* Summary */}
            {pricing && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3">
                <span className="text-sm text-gray-500">Total estimado</span>
                <span className="text-lg font-bold" style={{ color: accent }}>{pricing.total.toFixed(0)} {currency}</span>
              </div>
            )}

            <button
              onClick={async () => {
                if (!customerName.trim() || !customerEmail.trim()) return;
                setSubmitting(true);
                const res = await fetch('/api/v1/quotes', {
                  method: 'POST',
                  headers: { ...headers, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    boatId: selectedBoat?.id, boatModel: selectedBoat?.model, boatLength: selectedBoat?.length,
                    customerName, customerEmail, customerPhone: customerPhone || null, customerNotes: customerNotes || null,
                    items: [{ productId: selectedProduct.id, sailType: selectedProduct.sailType, productName: selectedProduct.name, unitPrice: pricing?.total ? String(pricing.total) : null, configuration: config }],
                  }),
                });
                const { data } = await res.json();
                track('quote_created', { boatModel: selectedBoat?.model, sailType: selectedProduct.sailType, productId: selectedProduct.id });
                postMsg('aerolume:quote-created', { quoteId: data?.id, boat: selectedBoat, product: selectedProduct, configuration: config, customer: { name: customerName, email: customerEmail } });
                setSubmitting(false);
                setStep('done');
              }}
              disabled={submitting || !customerName.trim() || !customerEmail.trim()}
              className="w-full py-3.5 text-white text-sm rounded-xl font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : 'Solicitar presupuesto'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 5: DONE ═══════════════ */}
      {step === 'done' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Presupuesto solicitado</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Hemos recibido tu solicitud. Te contactaremos a <strong className="text-gray-700">{customerEmail}</strong> con el presupuesto detallado.
          </p>
          <button
            onClick={() => {
              setStep('boat'); setSelectedBoat(null); setSelectedProduct(null); setConfig({});
              setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setCustomerNotes(''); setQuery('');
            }}
            className="mt-6 px-6 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Nuevo presupuesto
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-300">
          Powered by <span style={{ color: accent }} className="font-medium">Aerolume</span>
        </p>
      </div>
    </div>
  );
}
