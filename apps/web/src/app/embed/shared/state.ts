'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import type { Boat, Pricing, Product, Step, Tenant } from './types';
import { PREVIEW_MOCK_BOAT, PREVIEW_MOCK_PRODUCTS, SAIL_GROUPS } from './constants';

/**
 * Shared configurator state + effects used by every template.
 * Keeps the state, fetching, pricing math, tracking, and postMessage
 * behavior in one place so each template only owns its rendering.
 */
export function useConfiguratorState({
  apiKey,
  tenant,
  previewMode,
}: {
  apiKey: string;
  tenant: Tenant;
  previewMode?: { step: Step };
}) {
  const isPreview = !!previewMode;
  const headers = { 'x-api-key': apiKey };

  // parentOrigin stays null until we trust a referrer origin. We never fall back
  // to '*' because postMessage payloads can include PII (email, phone, quoteId).
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (isPreview) return;
    if (document.referrer) {
      try {
        setParentOrigin(new URL(document.referrer).origin);
      } catch {}
    }
  }, [isPreview]);

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
  const accentDim = tenant.themeAccentDim || accent;
  const navy = tenant.themeNavy || '#0a2540';
  const textColor = tenant.themeText || '#0a1e3d';
  const fontDisplay = tenant.themeFontDisplay || 'Cormorant';
  const fontBody = tenant.themeFontBody || 'Manrope';
  const groupColors = {
    main: tenant.themeColorMain || SAIL_GROUPS.main.defaultColor,
    head: tenant.themeColorHead || SAIL_GROUPS.head.defaultColor,
    spi: tenant.themeColorSpi || SAIL_GROUPS.spi.defaultColor,
  };

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

  function calculatePrice(): Pricing | null {
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
    fetch('/api/v1/analytics', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, ...extra }),
    }).catch(() => {});
  }

  function postMsg(type: string, payload: unknown) {
    if (!parentOrigin) return;
    window.parent.postMessage({ type, payload }, parentOrigin);
  }

  function goBack() {
    const order: Step[] = ['boat', 'products', 'configure', 'preview', 'contact'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  function selectBoat(boat: Boat) {
    setSelectedBoat(boat);
    setQuery(boat.model);
    setBoatResults([]);
    setStep('products');
    track('boat_search', { boatModel: boat.model });
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setConfig({});
    setStep('configure');
    track('product_view', { sailType: product.sailType, productId: product.id });
    postMsg('aerolume:product-selected', product);
  }

  function resetAll() {
    setStep('boat');
    setSelectedBoat(null);
    setSelectedProduct(null);
    setConfig({});
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerNotes('');
    setQuery('');
    setExpertMode(false);
    setCustomAreas({});
  }

  async function submitQuote(): Promise<void> {
    if (!selectedProduct || !customerName.trim() || !customerEmail.trim()) return;
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
          boatId: selectedBoat?.id,
          boatModel: selectedBoat?.model,
          boatLength: selectedBoat?.length,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          customerNotes: customerNotes || null,
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
    track('quote_created', {
      boatModel: selectedBoat?.model,
      sailType: selectedProduct.sailType,
      productId: selectedProduct.id,
      expertMode: isCustomArea,
    });
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
  }

  useEffect(() => {
    track('configurator_opened');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire-and-forget on mount
  }, []);

  useEffect(() => {
    if (isPreview) return;
    const value = deferredQuery.trim();
    if (value.length < 2) { setBoatResults([]); return; }
    const controller = new AbortController();
    setSearchLoading(true);
    fetch(`/api/v1/boats/search?query=${encodeURIComponent(value)}`, { headers, signal: controller.signal })
      .then((r) => r.json()).then(({ data }) => setBoatResults(data || []))
      .catch((e) => e.name !== 'AbortError' && console.error(e))
      .finally(() => setSearchLoading(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- headers derived from apiKey; re-fetch only on query change
  }, [deferredQuery, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    if (!selectedBoat) return;
    setProductsLoading(true);
    fetch('/api/v1/products', { headers }).then((r) => r.json())
      .then(({ data }) => { setProducts((data || []).filter((p: Product) => p.configFields)); setProductsLoading(false); })
      .catch(() => setProductsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- headers derived from apiKey; re-fetch only on boat change
  }, [selectedBoat, isPreview]);

  useEffect(() => {
    const observer = new ResizeObserver(() => postMsg('aerolume:resize', { height: document.body.scrollHeight }));
    observer.observe(document.body);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // flags
    isPreview,
    // search/boat
    query, setQuery,
    boatResults,
    selectedBoat,
    searchLoading,
    selectBoat,
    // products
    products, productsLoading,
    selectedProduct,
    selectProduct,
    // config
    config, setConfig,
    // expert mode
    expertMode, setExpertMode,
    customAreas, setCustomAreas,
    // step
    step, setStep,
    goBack,
    // contact
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    customerNotes, setCustomerNotes,
    // submit
    submitting, submitError, submitQuote,
    resetAll,
    // derived
    pricing, currency,
    // helpers
    getBoatSailArea, getEffectiveArea, getPricePerSqm,
    // theme
    accent, accentDim, navy, textColor, fontDisplay, fontBody, groupColors,
  };
}

export type ConfiguratorState = ReturnType<typeof useConfiguratorState>;
