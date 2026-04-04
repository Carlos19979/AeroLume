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
};

type SailGroup = 'main' | 'head' | 'spi';

const SAIL_GROUPS: Record<SailGroup, { label: string; types: string[] }> = {
  main: { label: 'Vela mayor', types: ['gvstd', 'gvfull', 'gve'] },
  head: { label: 'Vela de proa', types: ['gse', 'gn'] },
  spi: { label: 'Portantes', types: ['spiasy', 'spisym', 'furling', 'gen'] },
};

const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clásica',
  gvfull: 'Mayor Full Batten',
  gve: 'Mayor Enrollable',
  gse: 'Génova Enrollable',
  gn: 'Génova Mosquetones',
  gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simétrico',
  spiasy: 'Spinnaker Asimétrico',
  furling: 'Code S',
};

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
  const [step, setStep] = useState<'boat' | 'products' | 'configure' | 'contact' | 'done'>('boat');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const headers = { 'x-api-key': apiKey };

  // Search boats
  useEffect(() => {
    const value = deferredQuery.trim();
    if (value.length < 2) {
      setBoatResults([]);
      return;
    }
    const controller = new AbortController();
    setSearchLoading(true);
    fetch(`/api/v1/boats/search?query=${encodeURIComponent(value)}`, {
      headers,
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(({ data }) => setBoatResults(data || []))
      .catch((e) => e.name !== 'AbortError' && console.error(e))
      .finally(() => setSearchLoading(false));
    return () => controller.abort();
  }, [deferredQuery]);

  // Load products when boat is selected
  useEffect(() => {
    if (!selectedBoat) return;
    setProductsLoading(true);
    fetch('/api/v1/products', { headers })
      .then((r) => r.json())
      .then(({ data }) => {
        setProducts((data || []).filter((p: Product) => p.configFields));
        setProductsLoading(false);
      })
      .catch(() => setProductsLoading(false));
  }, [selectedBoat]);

  function selectBoat(boat: Boat) {
    setSelectedBoat(boat);
    setQuery(boat.model);
    setBoatResults([]);
    setStep('products');
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setConfig({});
    setStep('configure');
  }

  function postMessage(type: string, payload: any) {
    window.parent.postMessage({ type, payload }, '*');
  }

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      postMessage('aerolume:resize', { height: document.body.scrollHeight });
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--navy, #0a2540)' }}>
          Configurador de Velas
        </h1>
        <p className="text-sm text-gray-500 mt-1">por {tenant.name}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <button
          onClick={() => setStep('boat')}
          className={`px-3 py-1 rounded-full ${step === 'boat' ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
          style={step === 'boat' ? { backgroundColor: 'var(--accent, #0b5faa)' } : undefined}
        >
          1. Barco
        </button>
        <span className="text-gray-300">&rarr;</span>
        <button
          onClick={() => selectedBoat && setStep('products')}
          disabled={!selectedBoat}
          className={`px-3 py-1 rounded-full ${step === 'products' ? 'text-white' : 'bg-gray-100 text-gray-500'} disabled:opacity-40`}
          style={step === 'products' ? { backgroundColor: 'var(--accent, #0b5faa)' } : undefined}
        >
          2. Vela
        </button>
        <span className="text-gray-300">&rarr;</span>
        <button
          onClick={() => selectedProduct && setStep('configure')}
          disabled={!selectedProduct}
          className={`px-3 py-1 rounded-full ${step === 'configure' ? 'text-white' : 'bg-gray-100 text-gray-500'} disabled:opacity-40`}
          style={step === 'configure' ? { backgroundColor: 'var(--accent, #0b5faa)' } : undefined}
        >
          3. Configurar
        </button>
      </div>

      {/* Step 1: Boat search */}
      {step === 'boat' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Busca tu barco (ej: Bavaria 38, Beneteau 40...)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedBoat(null); }}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--accent, #0b5faa)' } as React.CSSProperties}
            />
            {searchLoading && (
              <span className="absolute right-3 top-3 text-gray-400 text-sm">...</span>
            )}
          </div>

          {boatResults.length > 0 && (
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {boatResults.map((boat) => (
                <button
                  key={boat.id}
                  onClick={() => selectBoat(boat)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm"
                >
                  <span className="font-medium text-gray-900">{boat.model}</span>
                  {boat.length && (
                    <span className="text-gray-400 ml-2">{boat.length}m</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedBoat && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">{selectedBoat.model}</p>
              <p className="text-xs text-blue-600 mt-1">
                Eslora: {selectedBoat.length || '—'}m
              </p>
              <button
                onClick={() => setStep('products')}
                className="mt-3 px-4 py-2 text-white text-sm rounded-lg"
                style={{ backgroundColor: 'var(--accent, #0b5faa)' }}
              >
                Elegir vela &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Products */}
      {step === 'products' && (
        <div className="space-y-6">
          {selectedBoat && (
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600">
              Barco: <strong>{selectedBoat.model}</strong> ({selectedBoat.length}m)
            </div>
          )}

          {productsLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Cargando productos...</div>
          ) : (
            Object.entries(SAIL_GROUPS).map(([groupKey, group]) => {
              const groupProducts = products.filter((p) =>
                group.types.includes(p.sailType)
              );
              if (groupProducts.length === 0) return null;

              return (
                <div key={groupKey}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{group.label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          selectProduct(product);
                          postMessage('aerolume:product-selected', product);
                        }}
                        className="text-left border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {SAIL_TYPE_LABELS[product.sailType] || product.sailType}
                        </p>
                        {product.basePrice && (
                          <p className="text-sm font-semibold mt-2" style={{ color: 'var(--accent, #0b5faa)' }}>
                            desde {Number(product.basePrice).toFixed(0)} {product.currency || 'EUR'}
                          </p>
                        )}
                        {product.descriptionShort && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {product.descriptionShort}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 'configure' && selectedProduct && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600">
            Barco: <strong>{selectedBoat?.model}</strong> &middot; Vela: <strong>{selectedProduct.name}</strong>
          </div>

          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h3 className="font-medium text-gray-900">Configurar {selectedProduct.name}</h3>

            {selectedProduct.configFields
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((field) => (
                <div key={field.id}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {field.fieldType === 'select' && Array.isArray(field.options) ? (
                    <select
                      value={config[field.key] || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={config[field.key] || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}

            <button
              onClick={() => setStep('contact')}
              className="w-full py-3 text-white text-sm rounded-lg font-medium"
              style={{ backgroundColor: 'var(--accent, #0b5faa)' }}
            >
              Continuar &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Contact info */}
      {step === 'contact' && selectedProduct && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600">
            Barco: <strong>{selectedBoat?.model}</strong> &middot; Vela: <strong>{selectedProduct.name}</strong>
          </div>

          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h3 className="font-medium text-gray-900">Datos de contacto</h3>
            <p className="text-sm text-gray-500">Para enviarte el presupuesto detallado.</p>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="+34 600 000 000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notas</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Cualquier detalle adicional..."
              />
            </div>

            <button
              onClick={async () => {
                if (!customerName.trim() || !customerEmail.trim()) return;
                setSubmitting(true);

                const res = await fetch('/api/v1/quotes', {
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
                      configuration: config,
                    }],
                  }),
                });

                const { data } = await res.json();
                postMessage('aerolume:quote-created', {
                  quoteId: data?.id,
                  boat: selectedBoat,
                  product: selectedProduct,
                  configuration: config,
                  customer: { name: customerName, email: customerEmail },
                });

                setSubmitting(false);
                setStep('done');
              }}
              disabled={submitting || !customerName.trim() || !customerEmail.trim()}
              className="w-full py-3 text-white text-sm rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent, #0b5faa)' }}
            >
              {submitting ? 'Enviando...' : 'Solicitar presupuesto'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Done */}
      {step === 'done' && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">&#9989;</div>
          <h3 className="text-lg font-semibold text-gray-900">Presupuesto solicitado</h3>
          <p className="text-sm text-gray-500 mt-2">
            Hemos recibido tu solicitud. Te contactaremos a <strong>{customerEmail}</strong> con el presupuesto detallado.
          </p>
          <button
            onClick={() => {
              setStep('boat');
              setSelectedBoat(null);
              setSelectedProduct(null);
              setConfig({});
              setCustomerName('');
              setCustomerEmail('');
              setCustomerPhone('');
              setCustomerNotes('');
              setQuery('');
            }}
            className="mt-6 px-6 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Nuevo presupuesto
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-300">
          Powered by <span style={{ color: 'var(--accent, #0b5faa)' }}>Aerolume</span>
        </p>
      </div>
    </div>
  );
}
