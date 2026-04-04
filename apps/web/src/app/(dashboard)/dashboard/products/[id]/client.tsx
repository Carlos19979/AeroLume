'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clásica',
  gvfull: 'Mayor Full Batten',
  gve: 'Mayor Enrollable',
  gse: 'Génova Enrollable',
  gn: 'Génova Mosquetones',
  gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simétrico',
  spiasy: 'Spinnaker Asimétrico',
  furling: 'Code S / Furling',
};

type Product = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  sailType: string;
  basePrice: string | null;
  currency: string | null;
  descriptionShort: string | null;
  descriptionFull: string | null;
  active: boolean | null;
  sortOrder: number | null;
  externalId: string | null;
  createdAt: Date | null;
  [key: string]: any;
};

type ConfigField = {
  id: string;
  productId: string;
  key: string;
  label: string;
  fieldType: string | null;
  options: any;
  sortOrder: number | null;
  required: boolean | null;
  priceModifiers: any;
};

export function ProductEditClient({
  product: initialProduct,
  initialFields,
}: {
  product: Product;
  initialFields: ConfigField[];
}) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [fields, setFields] = useState(initialFields);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(product.name);
  const [sailType, setSailType] = useState(product.sailType);
  const [basePrice, setBasePrice] = useState(product.basePrice || '');
  const [descriptionShort, setDescriptionShort] = useState(product.descriptionShort || '');
  const [active, setActive] = useState(product.active ?? true);

  const [showAddField, setShowAddField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  async function handleSaveProduct() {
    setSaving(true);
    const res = await fetch(`/api/internal/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        sailType,
        basePrice: basePrice || null,
        descriptionShort: descriptionShort || null,
        active,
      }),
    });
    const { data } = await res.json();
    if (data) setProduct(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddField() {
    if (!newFieldKey.trim() || !newFieldLabel.trim()) return;

    const options = newFieldOptions
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const res = await fetch(`/api/internal/products/${product.id}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: newFieldKey,
        label: newFieldLabel,
        fieldType: 'select',
        options,
        sortOrder: fields.length,
      }),
    });
    const { data } = await res.json();

    setFields((prev) => [...prev, data]);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldOptions('');
    setShowAddField(false);
  }

  async function handleDeleteField(fieldId: string) {
    if (!confirm('¿Eliminar este campo de configuración?')) return;

    await fetch(`/api/internal/products/${product.id}/fields?fieldId=${fieldId}`, {
      method: 'DELETE',
    });
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Información del producto</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de vela</label>
              <select
                value={sailType}
                onChange={(e) => setSailType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {Object.entries(SAIL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio base (EUR)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción corta</label>
            <textarea
              value={descriptionShort}
              onChange={(e) => setDescriptionShort(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Estado:</label>
            <button
              onClick={() => setActive(!active)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {active ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveProduct}
              disabled={saving}
              className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 self-center">Guardado</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Campos de configuración</h3>
            <button
              onClick={() => setShowAddField(true)}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              + Añadir campo
            </button>
          </div>

          {showAddField && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Clave (key)</label>
                  <input
                    type="text"
                    placeholder="ej: surface, fabric"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    placeholder="ej: Superficie (m²)"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Opciones (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="ej: 6.10, 7.50, 9.14, 12.20"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddField}
                  className="px-3 py-1.5 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90"
                >
                  Añadir
                </button>
                <button
                  onClick={() => setShowAddField(false)}
                  className="px-3 py-1.5 text-sm text-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {fields.length === 0 ? (
            <p className="text-sm text-gray-400">No hay campos de configuración.</p>
          ) : (
            <div className="space-y-2">
              {fields
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {field.label}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">({field.key})</span>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {Array.isArray(field.options) && field.options.length > 0
                          ? `${field.options.length} opciones: ${(field.options as string[]).slice(0, 3).join(', ')}${(field.options as string[]).length > 3 ? '...' : ''}`
                          : 'Sin opciones'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Detalles</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Slug</dt>
              <dd className="font-mono text-gray-900">{product.slug}</dd>
            </div>
            <div>
              <dt className="text-gray-500">ID externo</dt>
              <dd className="font-mono text-gray-900">{product.externalId || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Campos configurables</dt>
              <dd className="text-gray-900">{fields.length}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Creado</dt>
              <dd className="text-gray-900">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString('es')
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
