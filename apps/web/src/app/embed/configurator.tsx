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

const SAIL_GROUPS: Record<SailGroup, { label: string; types: string[]; tint: string }> = {
  main: { label: 'Vela mayor', types: ['gvstd', 'gvfull', 'gve'], tint: '59, 130, 246' },
  head: { label: 'Vela de proa', types: ['gse', 'gn'], tint: '16, 185, 129' },
  spi: { label: 'Portantes', types: ['spiasy', 'spisym', 'furling', 'gen'], tint: '168, 85, 247' },
};

const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clasica', gvfull: 'Mayor Full Batten', gve: 'Mayor Enrollable',
  gse: 'Genova Enrollable', gn: 'Genova Mosquetones', gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simetrico', spiasy: 'Spinnaker Asimetrico', furling: 'Code S',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'boat', label: 'Barco' },
  { key: 'products', label: 'Vela' },
  { key: 'configure', label: 'Opciones' },
  { key: 'contact', label: 'Contacto' },
];

function stepIndex(s: Step): number {
  if (s === 'done') return 4;
  return STEPS.findIndex((st) => st.key === s);
}

/* ── Sail SVG icon ── */
function SailIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 20h16L12 2z" opacity="0.15" fill={color} />
      <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" /><path d="M3 20h18" />
    </svg>
  );
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

  const inputClass = "w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 placeholder:text-gray-300";

  return (
    <div
      className="max-w-2xl mx-auto px-5 py-8 font-sans"
      style={{ '--ac': accent, '--ac-light': `${accent}12`, '--ac-mid': `${accent}30` } as React.CSSProperties}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {step !== 'boat' && step !== 'done' && (
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4L6 8L10 12" /></svg>
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: '#0a2540' }}>
              Configurador de Velas
            </h1>
            <p className="text-xs text-gray-400 -mt-0.5">por {tenant.name}</p>
          </div>
        </div>
        {/* Stepper pills */}
        {step !== 'done' && (
          <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1">
            {STEPS.map((s, i) => {
              const current = stepIndex(step);
              const done = i < current;
              const active = i === current;
              return (
                <button
                  key={s.key}
                  onClick={() => { if (done) setStep(s.key); }}
                  disabled={!done && !active}
                  className="relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                  style={
                    active
                      ? { backgroundColor: accent, color: '#fff', boxShadow: `0 2px 8px ${accent}40` }
                      : done
                        ? { backgroundColor: 'white', color: accent, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }
                        : { color: '#9ca3af' }
                  }
                >
                  {done ? `✓ ${s.label}` : s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CONTEXT PILLS ── */}
      {step !== 'boat' && step !== 'done' && selectedBoat && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-blue-100 bg-gradient-to-r from-blue-50 to-white">
            <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 17l6-6 4 4 8-8" /></svg>
            </span>
            <span className="text-xs font-semibold text-blue-900">{selectedBoat.model}</span>
            <span className="text-xs text-blue-400 font-medium">{selectedBoat.length}m</span>
          </div>
          {selectedProduct && step !== 'products' && (
            <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
              <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <SailIcon size={12} color="white" />
              </span>
              <span className="text-xs font-semibold text-emerald-900">{selectedProduct.name}</span>
              {(() => {
                const area = getBoatSailArea(selectedBoat, selectedProduct.sailType);
                return area ? <span className="text-xs text-emerald-400 font-medium">{area.toFixed(1)} m²</span> : null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          STEP 1: BOAT SEARCH
      ═══════════════════════════════════════════════ */}
      {step === 'boat' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              type="text"
              placeholder="Busca tu barco (ej: Bavaria 38, Beneteau 40...)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedBoat(null); }}
              className="w-full border-0 rounded-2xl pl-12 pr-4 py-4 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
              style={{ '--tw-ring-color': accent } as React.CSSProperties}
            />
            {searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            )}
          </div>

          {/* Results */}
          {boatResults.length > 0 && (
            <div className="rounded-2xl border border-gray-100 shadow-lg shadow-black/[0.04] overflow-hidden divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {boatResults.map((boat) => (
                <button
                  key={boat.id}
                  onClick={() => selectBoat(boat)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50/80 transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <SailIcon size={16} color="#3b82f6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{boat.model}</p>
                  </div>
                  {boat.length && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 shrink-0">{boat.length}m</span>
                  )}
                  <svg className="text-gray-200 group-hover:text-blue-400 shrink-0 transition-colors" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4L10 8L6 12" /></svg>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!query && !selectedBoat && (
            <div className="text-center py-16">
              <div
                className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}
              >
                <SailIcon size={36} color={accent} />
              </div>
              <p className="text-sm text-gray-500 font-medium">Empieza buscando el modelo de tu barco</p>
              <p className="text-xs text-gray-300 mt-1">Tenemos mas de 4.800 modelos en nuestra base de datos</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          STEP 2: PRODUCTS
      ═══════════════════════════════════════════════ */}
      {step === 'products' && (
        <div className="space-y-6">
          {productsLoading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-[3px] border-gray-100 border-t-gray-400 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-4 font-medium">Cargando velas disponibles...</p>
            </div>
          ) : (
            Object.entries(SAIL_GROUPS).map(([groupKey, group]) => {
              const groupProducts = products.filter((p) => group.types.includes(p.sailType));
              if (groupProducts.length === 0) return null;
              return (
                <div key={groupKey}>
                  {/* Group header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `rgba(${group.tint}, 0.1)` }}
                    >
                      <SailIcon size={16} color={`rgb(${group.tint})`} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">{group.label}</h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {/* Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupProducts.map((product) => {
                      const area = getBoatSailArea(selectedBoat, product.sailType);
                      const pricePerSqm = Number(product.basePrice) || 0;
                      const estimatedPrice = area && pricePerSqm ? area * pricePerSqm : null;
                      return (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="text-left rounded-2xl p-5 transition-all duration-200 group border border-transparent hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-0.5"
                          style={{
                            background: `linear-gradient(135deg, rgba(${group.tint}, 0.04), rgba(${group.tint}, 0.01))`,
                            borderColor: `rgba(${group.tint}, 0.12)`,
                          }}
                          onMouseEnter={(e) => { (e.currentTarget.style.borderColor = `rgba(${group.tint}, 0.35)`); }}
                          onMouseLeave={(e) => { (e.currentTarget.style.borderColor = `rgba(${group.tint}, 0.12)`); }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
                              <p className="text-xs text-gray-400 mt-1">{SAIL_TYPE_LABELS[product.sailType] || product.sailType}</p>
                              {area && (
                                <p className="text-xs mt-1 font-medium" style={{ color: `rgb(${group.tint})` }}>{area.toFixed(1)} m² para tu barco</p>
                              )}
                            </div>
                            {estimatedPrice && (
                              <div className="text-right shrink-0 ml-3">
                                <p className="text-xs text-gray-400">desde</p>
                                <p className="text-lg font-bold leading-tight" style={{ color: accent }}>
                                  {estimatedPrice.toFixed(0)}
                                  <span className="text-xs font-medium text-gray-400 ml-0.5">{product.currency || currency}</span>
                                </p>
                              </div>
                            )}
                          </div>
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

      {/* ═══════════════════════════════════════════════
          STEP 3: CONFIGURE
      ═══════════════════════════════════════════════ */}
      {step === 'configure' && selectedProduct && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-50" style={{ background: `linear-gradient(135deg, ${accent}08, transparent)` }}>
              <h3 className="font-bold text-gray-900">Configurar {selectedProduct.name}</h3>
              {(() => {
                const area = getBoatSailArea(selectedBoat, selectedProduct.sailType);
                return area ? <p className="text-xs text-gray-400 mt-0.5">Superficie calculada: {area.toFixed(2)} m²</p> : null;
              })()}
            </div>

            {/* Fields */}
            <div className="p-6 space-y-4">
              {selectedProduct.configFields
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => {
                  const mods = field.priceModifiers as Record<string, number> | null;
                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-0.5 normal-case">*</span>}
                      </label>
                      {field.fieldType === 'select' && Array.isArray(field.options) ? (
                        <select
                          value={config[field.key] || ''}
                          onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className={inputClass}
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
                          className={inputClass}
                          style={{ '--tw-ring-color': accent } as React.CSSProperties}
                        />
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Price breakdown */}
            {pricing && (
              <div className="mx-6 mb-6 rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, #0a2540, ${accent})` }}>
                <div className="p-5 space-y-2">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>{getBoatSailArea(selectedBoat, selectedProduct.sailType)?.toFixed(2)} m² x {Number(selectedProduct.basePrice).toFixed(0)} {currency}/m²</span>
                    <span>{pricing.base.toFixed(0)} {currency}</span>
                  </div>
                  {pricing.extras.map((extra, i) => (
                    <div key={i} className="flex justify-between text-sm text-white/50">
                      <span>{extra.label}</span>
                      <span>+{extra.amount} {currency}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-baseline pt-3 border-t border-white/15">
                    <span className="text-sm text-white/70 font-medium">Total estimado</span>
                    <span className="text-2xl font-bold text-white">{pricing.total.toFixed(0)} <span className="text-sm font-medium text-white/60">{currency}</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Continue */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setStep('contact')}
                className="w-full py-3.5 text-white text-sm rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: accent }}
              >
                Continuar
                <svg className="inline ml-2 -mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4L10 8L6 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          STEP 4: CONTACT
      ═══════════════════════════════════════════════ */}
      {step === 'contact' && selectedProduct && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50" style={{ background: `linear-gradient(135deg, ${accent}08, transparent)` }}>
              <h3 className="font-bold text-gray-900">Datos de contacto</h3>
              <p className="text-xs text-gray-400 mt-0.5">Para enviarte el presupuesto detallado.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nombre *</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass} style={{ '--tw-ring-color': accent } as React.CSSProperties}
                    placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email *</label>
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                    className={inputClass} style={{ '--tw-ring-color': accent } as React.CSSProperties}
                    placeholder="tu@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Telefono</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  className={inputClass} style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  placeholder="+34 600 000 000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notas</label>
                <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={3}
                  className={`${inputClass} resize-none`} style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  placeholder="Cualquier detalle adicional..." />
              </div>
            </div>

            {/* Summary + Submit */}
            <div className="px-6 pb-6 space-y-3">
              {pricing && (
                <div className="flex items-center justify-between rounded-2xl px-5 py-3" style={{ background: `linear-gradient(135deg, #0a2540, ${accent})` }}>
                  <span className="text-sm text-white/70 font-medium">Total estimado</span>
                  <span className="text-xl font-bold text-white">{pricing.total.toFixed(0)} <span className="text-sm font-medium text-white/60">{currency}</span></span>
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
                className="w-full py-3.5 text-white text-sm rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                style={{ backgroundColor: accent }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <>
                    Solicitar presupuesto
                    <svg className="inline ml-2 -mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          STEP 5: DONE
      ═══════════════════════════════════════════════ */}
      {step === 'done' && (
        <div className="text-center py-12">
          <style>{`
            @keyframes check-draw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
            @keyframes scale-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes fade-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .anim-check { animation: scale-in 0.4s ease-out, check-draw 0.4s ease-out 0.3s both; }
            .anim-text { animation: fade-up 0.4s ease-out 0.5s both; }
            .anim-btn { animation: fade-up 0.4s ease-out 0.7s both; }
          `}</style>
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center anim-check"
            style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)` }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray: 24 }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 anim-text">Presupuesto solicitado</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto anim-text">
            Hemos recibido tu solicitud. Te contactaremos a <strong className="text-gray-700">{customerEmail}</strong> con el presupuesto detallado.
          </p>
          <button
            onClick={() => {
              setStep('boat'); setSelectedBoat(null); setSelectedProduct(null); setConfig({});
              setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setCustomerNotes(''); setQuery('');
            }}
            className="mt-6 px-6 py-2.5 text-sm rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 anim-btn"
          >
            Nuevo presupuesto
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="mt-10 text-center">
        <p className="text-[10px] text-gray-300 tracking-wide">
          Powered by <span style={{ color: accent }} className="font-semibold">Aerolume</span>
        </p>
      </div>
    </div>
  );
}
