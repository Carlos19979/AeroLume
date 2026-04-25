'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import Image from 'next/image';
import { SAIL_TYPE_LABELS } from '@/lib/constants';
import { SailPreview } from './sail-preview';
import { EditorialConfigurator } from './templates/editorial/Configurator';
import { PremiumConfigurator } from './templates/premium/Configurator';
import { MarineConfigurator } from './templates/marine/Configurator';
import { resolveCopy } from './templates/copy';
import type { TemplateTenant } from './templates/types';

type Tenant = TemplateTenant;

type Boat = {
  id: string;
  model: string;
  boatModel: string | null;
  length: string | null;
  [key: string]: unknown;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sailType: string;
  variant: 'cruising' | 'cruising_plus' | 'cruising_racing' | null;
  basePrice: string | null;
  currency: string | null;
  descriptionShort: string | null;
  features: string[] | null;
  configFields: ConfigField[];
  pricingTiers: PricingTier[];
};

type ConfigField = {
  id: string;
  key: string;
  label: string;
  fieldType: string | null;
  options: string[];
  sortOrder: number | null;
  required: boolean | null;
  msrpModifiers: Record<string, number> | null;
  percentModifiers: Record<string, number> | null;
};

type PricingTier = {
  id: string;
  minSqm: string;
  maxSqm: string;
  msrpPerSqm: string;
  sortOrder: number | null;
};


type Step = 'boat' | 'products' | 'configure' | 'preview' | 'contact' | 'done';
type SailGroup = 'main' | 'head' | 'spi';

const SAIL_GROUPS: Record<SailGroup, { label: string; types: string[]; defaultColor: string }> = {
  main: { label: 'Vela mayor', types: ['gvstd', 'gvfull', 'gve'], defaultColor: '#3b82f6' },
  head: { label: 'Vela de proa', types: ['gse', 'gn'], defaultColor: '#10b981' },
  spi: { label: 'Portantes', types: ['spiasy', 'spisym', 'furling', 'gen'], defaultColor: '#a855f7' },
};

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}


const STEPS: { key: Step; label: string }[] = [
  { key: 'boat', label: 'Barco' },
  { key: 'products', label: 'Vela' },
  { key: 'configure', label: 'Opciones' },
  { key: 'preview', label: 'Vista previa' },
  { key: 'contact', label: 'Contacto' },
];

function stepIndex(s: Step): number {
  if (s === 'done') return STEPS.length;
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

const PREVIEW_MOCK_BOAT: Boat = {
  id: 'preview-boat',
  model: 'Bavaria 40',
  boatModel: 'Bavaria 40',
  length: '12.2',
  gvstd: '46.5',
  gse: '31.8',
  spiasy: '69.1',
};

const PREVIEW_MOCK_PRODUCTS: Product[] = [
  {
    id: 'preview-prod-1',
    name: 'Mayor Clásica',
    slug: 'mayor-clasica',
    sailType: 'gvstd',
    variant: 'cruising',
    basePrice: '28',
    currency: 'EUR',
    descriptionShort: 'Vela mayor de crucero en laminado dacron',
    features: ['Grátil reforzado', 'Bolsillo de palo'],
    configFields: [
      {
        id: 'cf-1',
        key: 'tela',
        label: 'Tela',
        fieldType: 'select',
        options: ['Dacron 170g', 'Dacron 200g', 'Laminado'],
        sortOrder: 0,
        required: true,
        msrpModifiers: { 'Dacron 200g': 80, 'Laminado': 320 },
        percentModifiers: null,
      },
      {
        id: 'cf-2',
        key: 'rizos',
        label: 'Rizos',
        fieldType: 'select',
        options: ['1 rizo', '2 rizos', '3 rizos'],
        sortOrder: 1,
        required: false,
        msrpModifiers: { '2 rizos': 45, '3 rizos': 90 },
        percentModifiers: null,
      },
    ],
    pricingTiers: [
      { id: 'pt-1', minSqm: '0', maxSqm: '60', msrpPerSqm: '28', sortOrder: 0 },
      { id: 'pt-2', minSqm: '60', maxSqm: '999', msrpPerSqm: '26', sortOrder: 1 },
    ],
  },
  {
    id: 'preview-prod-2',
    name: 'Génova Enrollable',
    slug: 'genova-enrollable',
    sailType: 'gse',
    variant: 'cruising',
    basePrice: '32',
    currency: 'EUR',
    descriptionShort: 'Génova para enrollador de proa',
    features: ['Baluma reforzada', 'Parche de escota'],
    configFields: [
      {
        id: 'cf-3',
        key: 'tela',
        label: 'Tela',
        fieldType: 'select',
        options: ['Dacron 150g', 'Dacron 180g'],
        sortOrder: 0,
        required: true,
        msrpModifiers: { 'Dacron 180g': 60 },
        percentModifiers: null,
      },
    ],
    pricingTiers: [
      { id: 'pt-3', minSqm: '0', maxSqm: '999', msrpPerSqm: '32', sortOrder: 0 },
    ],
  },
];

export function EmbedConfigurator(props: { apiKey: string; tenant: Tenant; previewMode?: { step: Step } }) {
  switch (props.tenant.themeTemplate) {
    case 'editorial':
      return <EditorialConfigurator {...props} />;
    case 'premium':
      return <PremiumConfigurator {...props} />;
    case 'marine':
      return <MarineConfigurator {...props} />;
    default:
      return <MinimalEmbedConfigurator {...props} />;
  }
}

function MinimalEmbedConfigurator({ apiKey, tenant, previewMode }: { apiKey: string; tenant: Tenant; previewMode?: { step: Step } }) {
  const isPreview = !!previewMode;

  // parentOrigin stays null until we trust a referrer origin. We never fall back to '*'
  // because postMessage payloads can include PII (email, phone, quoteId).
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (isPreview) return;
    if (document.referrer) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time parent origin detection on mount
        setParentOrigin(new URL(document.referrer).origin);
      } catch {}
    }
  }, []);

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [boatResults, setBoatResults] = useState<Boat[]>(isPreview ? [PREVIEW_MOCK_BOAT] : []);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(isPreview ? PREVIEW_MOCK_BOAT : null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(isPreview ? PREVIEW_MOCK_PRODUCTS : []);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(isPreview ? PREVIEW_MOCK_PRODUCTS[0] : null);
  const [config, setConfig] = useState<Record<string, string>>(isPreview ? { tela: 'Dacron 170g', rizos: '2 rizos' } : {});
  const [step, setStep] = useState<Step>(isPreview ? previewMode.step : 'boat');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [customAreas, setCustomAreas] = useState<Record<string, string>>({});

  const accent = tenant.themeAccent || '#0b5faa';
  const navy = tenant.themeNavy || '#0a2540';
  const textColor = tenant.themeText || '#0a1e3d';
  const fontDisplay = tenant.themeFontDisplay || 'Cormorant';
  const fontBody = tenant.themeFontBody || 'Manrope';
  const groupColors: Record<SailGroup, string> = {
    main: tenant.themeColorMain || SAIL_GROUPS.main.defaultColor,
    head: tenant.themeColorHead || SAIL_GROUPS.head.defaultColor,
    spi: tenant.themeColorSpi || SAIL_GROUPS.spi.defaultColor,
  };
  const headers = { 'x-api-key': apiKey };

  function getBoatSailArea(boat: Boat | null, sailType: string): number | null {
    if (!boat) return null;
    const val = boat[sailType];
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  function getEffectiveArea(product: Pick<Product, 'id' | 'sailType'> | null): number | null {
    if (!product) return null;
    const def = getBoatSailArea(selectedBoat, product.sailType);
    if (!expertMode) return def;
    const custom = customAreas[product.id];
    if (custom === undefined || custom === '') return def;
    const n = Number(custom);
    return !isFinite(n) || n <= 0 ? def : n;
  }

  function getPricePerSqm(product: Product, area: number): number {
    const tier = product.pricingTiers?.find((t) => area >= Number(t.minSqm) && area <= Number(t.maxSqm));
    if (tier) return Number(tier.msrpPerSqm) || 0;
    return Number(product.basePrice) || 0;
  }

  function calculatePrice(): { base: number; extras: { label: string; amount: number }[]; pricePerSqm: number; total: number } | null {
    if (!selectedProduct || !selectedBoat) return null;
    const area = getEffectiveArea(selectedProduct);
    if (!area) return null;
    const pricePerSqm = getPricePerSqm(selectedProduct, area);
    if (!pricePerSqm) return null;
    const baseArea = area * pricePerSqm;

    let flatSum = 0;
    let pctSum = 0;
    const flatExtras: { label: string; amount: number }[] = [];
    const pctEntries: { label: string; pct: number }[] = [];

    for (const field of selectedProduct.configFields) {
      const selected = config[field.key];
      if (!selected) continue;
      const flat = field.msrpModifiers?.[selected];
      const pct = field.percentModifiers?.[selected];
      if (typeof flat === 'number' && flat !== 0) {
        flatSum += flat;
        flatExtras.push({ label: `${field.label}: ${selected}`, amount: flat });
      }
      if (typeof pct === 'number' && pct !== 0) {
        pctSum += pct;
        pctEntries.push({ label: `${field.label}: ${selected}`, pct });
      }
    }

    const subtotal = baseArea + flatSum;
    const total = subtotal * (1 + pctSum);
    const pctExtras = pctEntries.map((e) => ({
      label: `${e.label} (+${(e.pct * 100).toFixed(0)}%)`,
      amount: subtotal * e.pct,
    }));

    return { base: baseArea, pricePerSqm, extras: [...flatExtras, ...pctExtras], total };
  }

  const pricing = calculatePrice();
  const currency = selectedProduct?.currency || tenant.currency || 'EUR';

  function track(eventType: string, extra?: Record<string, unknown>) {
    if (isPreview) return;
    fetch('/api/v1/analytics', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType, ...extra }) }).catch(() => {});
  }

  function goBack() {
    const order: Step[] = ['boat', 'products', 'configure', 'preview', 'contact'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  useEffect(() => { track('configurator_opened'); }, []);

  useEffect(() => {
    if (isPreview) return;
    const value = deferredQuery.trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset search results when query is too short
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
    if (isPreview) return;
    if (!selectedBoat) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- set loading flag before async fetch
    setProductsLoading(true);
    fetch('/api/v1/products', { headers }).then((r) => r.json())
      .then(({ data }) => { setProducts((data || []).filter((p: Product) => p.configFields)); setProductsLoading(false); })
      .catch(() => setProductsLoading(false));
  }, [selectedBoat]);

  function selectBoat(boat: Boat) {
    setSelectedBoat(boat); setQuery(boat.model); setBoatResults([]); setStep('products');
    track('boat_search', { boatModel: boat.model });
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product); setConfig({}); setStep('configure');
    track('product_view', { sailType: product.sailType, productId: product.id });
    postMsg('aerolume:product-selected', product);
  }

  function postMsg(type: string, payload: unknown) {
    // No trusted parent origin → silently no-op (e.g. configurator opened as a top-level page,
    // or the parent referrer couldn't be parsed). Avoids leaking PII to '*'.
    if (!parentOrigin) return;
    window.parent.postMessage({ type, payload }, parentOrigin);
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => postMsg('aerolume:resize', { height: document.body.scrollHeight }));
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const inputClass = "w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 placeholder:text-gray-300";

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-5 py-8 min-h-[640px]"
      style={{ fontFamily: `${fontBody}, system-ui, sans-serif`, color: textColor } as React.CSSProperties}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 min-w-0">
          {step !== 'boat' && step !== 'done' && (
            <button
              onClick={goBack}
              aria-label="Atrás"
              className="w-9 h-9 shrink-0 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4L6 8L10 12" /></svg>
            </button>
          )}
          <div className="flex items-center gap-2.5 min-w-0">
            {tenant.logoUrl && (
              <Image src={tenant.logoUrl} alt={tenant.name} width={112} height={28} unoptimized className="h-7 w-auto object-contain" />
            )}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate" style={{ color: textColor, fontFamily: `${fontDisplay}, serif` }}>
                Configurador de Velas
              </h1>
              <p className="text-xs -mt-0.5" style={{ color: `${textColor}60` }}>por {tenant.name}</p>
            </div>
          </div>
        </div>
        {/* Stepper pills — hidden on mobile (replaced by progress bar below) */}
        {step !== 'done' && (() => {
          const current = stepIndex(step);
          return (
            <div className="hidden sm:flex items-center gap-1 bg-gray-100/80 rounded-full p-1 shrink-0">
              {STEPS.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <button
                    key={s.key}
                    data-testid={`embed-step-${s.key}`}
                    onClick={() => { if (!isPreview && done) setStep(s.key); }}
                    disabled={isPreview || (!done && !active)}
                    className="relative shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300"
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
          );
        })()}
      </div>

      {/* Mobile-only progress bar — thin, full-width, tied to the step */}
      {step !== 'done' && (() => {
        const current = stepIndex(step);
        const percent = ((current + 1) / STEPS.length) * 100;
        return (
          <div className="sm:hidden mb-6">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: textColor }}>
                {STEPS[current]?.label}
              </span>
              <span className="text-[11px] tabular-nums" style={{ color: `${textColor}70` }}>
                Paso {current + 1} de {STEPS.length}
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, background: accent }}
              />
            </div>
          </div>
        );
      })()}

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
                const area = getEffectiveArea(selectedProduct);
                const isCustom = expertMode && !!customAreas[selectedProduct.id] && Number(customAreas[selectedProduct.id]) > 0;
                return area ? (
                  <span className="text-xs text-emerald-400 font-medium">
                    {area.toFixed(1)} m²{isCustom ? ' *' : ''}
                  </span>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          STEP 1: BOAT SEARCH
      ═══════════════════════════════════════════════ */}
      {step === 'boat' && (() => {
        const boatCopy = resolveCopy(tenant.themeCopy, 'minimal', 'boat');
        return (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: textColor, fontFamily: `${fontDisplay}, serif` }}>{boatCopy.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{boatCopy.subtitle}</p>
          </div>
          {/* Search */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              type="text"
              data-testid="embed-boat-search"
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
              {boatResults.map((boat, i) => (
                <button
                  key={boat.id}
                  data-testid={`embed-boat-result-${i}`}
                  onClick={() => selectBoat(boat)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50/80 transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <SailIcon size={16} color="#3b82f6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold transition-colors truncate" style={{ color: textColor }}>{boat.model}</p>
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
        );
      })()}

      {/* ═══════════════════════════════════════════════
          STEP 2: PRODUCTS
      ═══════════════════════════════════════════════ */}
      {step === 'products' && (() => {
        const productsCopy = resolveCopy(tenant.themeCopy, 'minimal', 'products');
        return (
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: textColor, fontFamily: `${fontDisplay}, serif` }}>{productsCopy.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{productsCopy.subtitle}</p>
          </div>
          {/* Expert mode toggle */}
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border p-4"
            style={{
              borderColor: expertMode ? `${accent}40` : '#f3f4f6',
              background: expertMode ? `linear-gradient(135deg, ${accent}08, transparent)` : '#fafafa',
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={expertMode ? accent : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
                </svg>
                <p className="text-sm font-semibold" style={{ color: textColor }}>Modo experto</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {expertMode
                  ? 'Puedes editar la superficie de cada vela. La superficie personalizada se enviará en el presupuesto.'
                  : 'Activa para editar manualmente la superficie de cada vela. Por defecto se usa la superficie calculada del barco.'}
              </p>
            </div>
            <button
              data-testid="embed-expert-toggle"
              onClick={() => setExpertMode((v) => !v)}
              role="switch"
              aria-checked={expertMode}
              aria-label="Activar modo experto"
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
              style={{ backgroundColor: expertMode ? accent : '#d1d5db' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                style={{ transform: expertMode ? 'translateX(24px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          {productsLoading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-[3px] border-gray-100 border-t-gray-400 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-4 font-medium">Cargando velas disponibles...</p>
            </div>
          ) : (
            Object.entries(SAIL_GROUPS).map(([groupKey, group]) => {
              const groupProducts = products.filter((p) => group.types.includes(p.sailType));
              if (groupProducts.length === 0) return null;
              const gc = groupColors[groupKey as SailGroup];
              const tint = hexToRgb(gc);
              return (
                <div key={groupKey}>
                  {/* Group header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `rgba(${tint}, 0.1)` }}
                    >
                      <SailIcon size={16} color={gc} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">{group.label}</h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {/* Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupProducts.map((product) => {
                      const defaultArea = getBoatSailArea(selectedBoat, product.sailType);
                      const area = getEffectiveArea(product);
                      const isCustom = expertMode && !!customAreas[product.id] && Number(customAreas[product.id]) > 0;
                      const pricePerSqm = area ? getPricePerSqm(product, area) : 0;
                      const estimatedPrice = area && pricePerSqm ? area * pricePerSqm : null;
                      return (
                        <div
                          key={product.id}
                          data-testid={`embed-product-card-${product.id}`}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('input, [data-no-select]')) return;
                            selectProduct(product);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectProduct(product); }
                          }}
                          className="text-left rounded-2xl p-5 transition-all duration-200 group border border-transparent hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2"
                          style={{
                            background: `linear-gradient(135deg, rgba(${tint}, 0.04), rgba(${tint}, 0.01))`,
                            borderColor: `rgba(${tint}, 0.12)`,
                            ['--tw-ring-color' as keyof React.CSSProperties]: `rgba(${tint}, 0.4)`,
                          }}
                          onMouseEnter={(e) => { (e.currentTarget.style.borderColor = `rgba(${tint}, 0.35)`); }}
                          onMouseLeave={(e) => { (e.currentTarget.style.borderColor = `rgba(${tint}, 0.12)`); }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-tight" style={{ color: textColor }}>{product.name}</p>
                              <p className="text-xs text-gray-400 mt-1">{SAIL_TYPE_LABELS[product.sailType] || product.sailType}</p>
                              {expertMode ? (
                                <div className="mt-2 flex items-center gap-1.5" data-no-select>
                                  <input
                                    type="number"
                                    data-testid={`embed-custom-area-${product.id}`}
                                    step="0.1"
                                    min="0"
                                    placeholder={defaultArea ? defaultArea.toFixed(1) : '0'}
                                    value={customAreas[product.id] ?? ''}
                                    onChange={(e) => setCustomAreas((prev) => ({ ...prev, [product.id]: e.target.value }))}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1"
                                    style={{ ['--tw-ring-color' as keyof React.CSSProperties]: accent }}
                                  />
                                  <span className="text-[11px] font-medium" style={{ color: `${textColor}99` }}>
                                    m²{isCustom ? ' (personalizada)' : defaultArea ? ` (def: ${defaultArea.toFixed(1)})` : ''}
                                  </span>
                                </div>
                              ) : (
                                area && (
                                  <p className="text-xs mt-1 font-medium" style={{ color: `${textColor}e6` }}>{area.toFixed(1)} m² para tu barco</p>
                                )
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════
          STEP 3: CONFIGURE
      ═══════════════════════════════════════════════ */}
      {step === 'configure' && selectedProduct && (() => {
        const configureCopy = resolveCopy(tenant.themeCopy, 'minimal', 'configure');
        return (
        <div className="space-y-5">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: textColor, fontFamily: `${fontDisplay}, serif` }}>{configureCopy.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{configureCopy.subtitle}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-50" style={{ background: `linear-gradient(135deg, ${accent}08, transparent)` }}>
              <h3 className="font-bold" style={{ color: textColor }}>Configurar {selectedProduct.name}</h3>
              {(() => {
                const area = getEffectiveArea(selectedProduct);
                const isCustom = expertMode && !!customAreas[selectedProduct.id] && Number(customAreas[selectedProduct.id]) > 0;
                return area ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Superficie {isCustom ? 'personalizada' : 'calculada'}: {area.toFixed(2)} m²
                  </p>
                ) : null;
              })()}
            </div>

            {/* Fields */}
            <div className="p-6 space-y-4">
              {selectedProduct.configFields
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => {
                  const mods = field.msrpModifiers as Record<string, number> | null;
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
                    <span>{getEffectiveArea(selectedProduct)?.toFixed(2)} m² x {pricing.pricePerSqm.toFixed(2)} {currency}/m²</span>
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
                data-testid="embed-continue-configure"
                onClick={() => setStep('preview')}
                className="w-full py-3.5 text-white text-sm rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: accent }}
              >
                Continuar
                <svg className="inline ml-2 -mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4L10 8L6 12" /></svg>
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════
          STEP 4: PREVIEW (sail visual + features)
      ═══════════════════════════════════════════════ */}
      {step === 'preview' && selectedProduct && (() => {
        const previewCopy = resolveCopy(tenant.themeCopy, 'minimal', 'preview');
        return (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: textColor, fontFamily: `${fontDisplay}, serif` }}>{previewCopy.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{previewCopy.subtitle}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
            <div className="px-5 py-3.5 border-b border-gray-50" style={{ background: `linear-gradient(135deg, ${accent}08, transparent)` }}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold truncate" style={{ color: textColor }}>{selectedProduct.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {SAIL_TYPE_LABELS[selectedProduct.sailType] || selectedProduct.sailType}
                    <span className="mx-1.5 text-gray-200">·</span>
                    {getEffectiveArea(selectedProduct)?.toFixed(1)} m²
                  </p>
                </div>
                {pricing && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                    <p className="text-lg font-bold leading-tight" style={{ color: accent }}>
                      {pricing.total.toFixed(0)}
                      <span className="text-xs font-medium text-gray-400 ml-0.5">{currency}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Split content: visual + info */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 p-4">
              {/* Visual — constrained square-ish */}
              <div className="md:sticky md:top-4 self-start">
                <div className="aspect-[4/5] max-h-[360px] mx-auto w-full">
                  <SailPreview
                    sailType={selectedProduct.sailType}
                    variant={selectedProduct.variant}
                    accent={accent}
                    reefs={config.rizos === '3 rizos' ? 3 : 2}
                  />
                </div>
              </div>

              {/* Info column */}
              <div className="flex flex-col min-w-0">
                {(() => {
                  const selectedOptions = selectedProduct.configFields
                    .map((field) => ({ field, value: config[field.key] }))
                    .filter((x) => x.value);
                  if (selectedOptions.length === 0) return null;
                  return (
                    <div data-testid="embed-config-summary" className="mb-3 rounded-xl border p-3" style={{ borderColor: `${accent}30`, background: `${accent}08` }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: accent }}>Tu configuración</p>
                      <ul className="space-y-1">
                        {selectedOptions.map(({ field, value }) => (
                          <li key={field.key} className="flex items-baseline justify-between gap-2 text-[13px]">
                            <span className="text-gray-500">{field.label}</span>
                            <span className="font-semibold text-gray-800 truncate">{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {selectedProduct.features && selectedProduct.features.length > 0 ? (
                  <>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Incluido de serie</p>
                    <ul data-testid="embed-features-list" className="grid grid-cols-1 gap-y-1.5 mb-4">
                      {selectedProduct.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700 leading-snug">
                          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 10l4 4 8-8" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-4">Sin características adicionales.</p>
                )}

                {/* Breakdown row */}
                {pricing && (
                  <div className="mt-auto pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>{getEffectiveArea(selectedProduct)?.toFixed(2)} m² × {pricing.pricePerSqm.toFixed(2)} €/m²</span>
                      <span className="font-medium text-gray-700">{pricing.base.toFixed(0)} {currency}</span>
                    </div>
                    {pricing.extras.map((extra, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate mr-2">{extra.label}</span>
                        <span className="font-medium text-gray-700 shrink-0">+{extra.amount.toFixed(0)} {currency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 pt-1">
              <button
                data-testid="embed-continue-preview"
                onClick={() => setStep('contact')}
                className="w-full py-3 text-white text-sm rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: accent }}
              >
                Solicitar presupuesto
                <svg className="inline ml-2 -mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4L10 8L6 12" /></svg>
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════
          STEP 5: CONTACT
      ═══════════════════════════════════════════════ */}
      {step === 'contact' && selectedProduct && (() => {
        const contactCopy = resolveCopy(tenant.themeCopy, 'minimal', 'contact');
        const contactTitle = tenant.themeContactTitle || contactCopy.title;
        const contactSubtitle = tenant.themeContactSubtitle || contactCopy.subtitle;
        return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50" style={{ background: `linear-gradient(135deg, ${accent}08, transparent)` }}>
              <h3 className="font-bold" style={{ color: textColor }}>{contactTitle}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{contactSubtitle}</p>
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
                  placeholder="+34 611 234 567" />
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
                data-testid="embed-submit-quote"
                onClick={async () => {
                  if (!customerName.trim() || !customerEmail.trim()) return;
                  setSubmitting(true);
                  setSubmitError(null);
                  const effectiveArea = getEffectiveArea(selectedProduct);
                  const isCustomArea = expertMode && !!customAreas[selectedProduct.id] && Number(customAreas[selectedProduct.id]) > 0;
                  let res: Response;
                  try {
                    res = await fetch('/api/v1/quotes', {
                      method: 'POST',
                      headers: { ...headers, 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        boatId: selectedBoat?.id, boatModel: selectedBoat?.model, boatLength: selectedBoat?.length,
                        customerName, customerEmail, customerPhone: customerPhone || null, customerNotes: customerNotes || null,
                        items: [{
                          productId: selectedProduct.id,
                          sailType: selectedProduct.sailType,
                          productName: selectedProduct.name,
                          sailArea: effectiveArea !== null ? String(effectiveArea) : null,
                          unitPrice: pricing?.total ? String(pricing.total) : null,
                          configuration: { ...config, ...(isCustomArea ? { _customSurface: true } : {}) },
                        }],
                      }),
                    });
                  } catch {
                    setSubmitting(false);
                    setSubmitError('No se pudo enviar el presupuesto. Comprueba tu conexion e intentalo de nuevo.');
                    return;
                  }
                  if (!res.ok) {
                    setSubmitting(false);
                    setSubmitError('No se pudo enviar el presupuesto. Por favor, intentalo de nuevo en unos instantes.');
                    return;
                  }
                  const { data } = await res.json();
                  track('quote_created', { boatModel: selectedBoat?.model, sailType: selectedProduct.sailType, productId: selectedProduct.id, expertMode: isCustomArea });
                  postMsg('aerolume:quote-created', {
                    quoteId: data?.id,
                    boat: selectedBoat,
                    product: selectedProduct,
                    configuration: config,
                    customer: { name: customerName, email: customerEmail },
                    sailArea: effectiveArea,
                    customSurface: isCustomArea,
                  });
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
                    {tenant.themeCtaLabel || 'Solicitar presupuesto'}
                    <svg className="inline ml-2 -mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                  </>
                )}
              </button>
              {submitError && (
                <div
                  data-testid="embed-submit-error"
                  role="alert"
                  className="rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-100"
                >
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

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
          <h3 className="text-xl font-bold anim-text" style={{ color: textColor }}>Presupuesto solicitado</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto anim-text">
            Hemos recibido tu solicitud. Te contactaremos a <strong className="text-gray-700">{customerEmail}</strong> con el presupuesto detallado.
          </p>
          <button
            onClick={() => {
              setStep('boat'); setSelectedBoat(null); setSelectedProduct(null); setConfig({});
              setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setCustomerNotes(''); setQuery('');
              setExpertMode(false); setCustomAreas({});
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
