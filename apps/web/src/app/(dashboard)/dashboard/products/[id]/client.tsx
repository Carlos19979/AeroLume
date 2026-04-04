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
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState(false);

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

  async function handleUpdateFieldPrices(fieldId: string, priceModifiers: Record<string, number>) {
    setSavingField(true);
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    await fetch(`/api/internal/products/${product.id}/fields`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: fieldId,
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        options: field.options,
        sortOrder: field.sortOrder,
        required: field.required,
        priceModifiers,
      }),
    });

    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, priceModifiers } : f))
    );
    setSavingField(false);
    setEditingFieldId(null);
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
              <label className="block text-sm text-gray-600 mb-1">Precio base (EUR/m²)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="45.00"
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
            <div className="space-y-3">
              {fields
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => {
                  const mods = (field.priceModifiers || {}) as Record<string, number>;
                  const options = Array.isArray(field.options) ? field.options as string[] : [];
                  const isEditing = editingFieldId === field.id;

                  return (
                    <div key={field.id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {field.label}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">({field.key})</span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {options.length} opciones
                            {Object.values(mods).some((v) => v > 0) && (
                              <span className="text-green-600 ml-2">· precios configurados</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                            className="text-[var(--accent)] hover:underline text-xs"
                          >
                            {isEditing ? 'Cerrar' : 'Precios'}
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {isEditing && options.length > 0 && (
                        <FieldPriceEditor
                          options={options}
                          priceModifiers={mods}
                          saving={savingField}
                          onSave={(newMods) => handleUpdateFieldPrices(field.id, newMods)}
                          onCancel={() => setEditingFieldId(null)}
                        />
                      )}
                    </div>
                  );
                })}
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

function FieldPriceEditor({
  options,
  priceModifiers,
  saving,
  onSave,
  onCancel,
}: {
  options: string[];
  priceModifiers: Record<string, number>;
  saving: boolean;
  onSave: (mods: Record<string, number>) => void;
  onCancel: () => void;
}) {
  const [mods, setMods] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const opt of options) {
      initial[opt] = String(priceModifiers[opt] ?? 0);
    }
    return initial;
  });

  function handleSave() {
    const parsed: Record<string, number> = {};
    for (const [key, val] of Object.entries(mods)) {
      parsed[key] = Number(val) || 0;
    }
    onSave(parsed);
  }

  return (
    <div className="border-t bg-gray-50 px-4 py-3 space-y-2">
      <p className="text-xs text-gray-500 mb-2">
        Extra en EUR por cada opción (0 = sin coste adicional)
      </p>
      {options.map((opt) => (
        <div key={opt} className="flex items-center gap-3">
          <span className="flex-1 text-sm text-gray-700 truncate">{opt}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">+</span>
            <input
              type="number"
              step="1"
              value={mods[opt] ?? '0'}
              onChange={(e) => setMods((prev) => ({ ...prev, [opt]: e.target.value }))}
              className="w-20 border rounded px-2 py-1 text-sm text-right"
            />
            <span className="text-xs text-gray-400">EUR</span>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar precios'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-gray-500"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
