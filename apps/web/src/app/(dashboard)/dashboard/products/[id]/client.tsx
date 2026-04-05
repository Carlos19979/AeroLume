'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAIL_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { SaveButton, useSaveState } from '@/components/ui/SaveButton';

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
  const { saving, saved, save } = useSaveState();

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
  const [error, setError] = useState<string | null>(null);

  async function handleSaveProduct() {
    await save(async () => {
      setError(null);
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
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      if (data) setProduct(data);
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    });
  }

  async function handleAddField(fieldData: { key: string; label: string; options: string[]; priceModifiers: Record<string, number> }) {
    try {
      setError(null);
      const res = await fetch(`/api/internal/products/${product.id}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: fieldData.key,
          label: fieldData.label,
          fieldType: 'select',
          options: fieldData.options,
          sortOrder: fields.length,
          priceModifiers: fieldData.priceModifiers,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      setFields((prev) => [...prev, data]);
      setShowAddField(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  async function handleUpdateField(fieldId: string, fieldData: { key: string; label: string; options: string[]; priceModifiers: Record<string, number> }) {
    setSavingField(true);
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    try {
      setError(null);
      const res = await fetch(`/api/internal/products/${product.id}/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fieldId,
          key: fieldData.key,
          label: fieldData.label,
          fieldType: field.fieldType,
          options: fieldData.options,
          sortOrder: field.sortOrder,
          required: field.required,
          priceModifiers: fieldData.priceModifiers,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }

      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, ...fieldData } : f))
      );
      setEditingFieldId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setSavingField(false);
    }
  }

  async function handleDeleteField(fieldId: string) {
    if (!confirm('¿Eliminar este campo de configuración?')) return;

    try {
      setError(null);
      const res = await fetch(`/api/internal/products/${product.id}/fields?fieldId=${fieldId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Información del producto</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de vela</label>
              <select
                value={sailType}
                onChange={(e) => setSailType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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

          <div className="pt-2">
            <SaveButton
              saving={saving}
              saved={saved}
              onClick={handleSaveProduct}
              className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Campos de configuración</h3>
            <button
              onClick={() => setShowAddField(true)}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              + Añadir campo
            </button>
          </div>

          {showAddField && (
            <FieldEditor
              mode="create"
              onSave={(data) => handleAddField(data)}
              onCancel={() => setShowAddField(false)}
            />
          )}

          {fields.length === 0 ? (
            <p className="text-sm text-gray-500">No hay campos de configuración.</p>
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
                          <span className="text-xs text-gray-500 ml-2">({field.key})</span>
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
                            className="text-[var(--color-accent)] hover:underline text-xs"
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

                      {isEditing && (
                        <FieldEditor
                          mode="edit"
                          initialKey={field.key}
                          initialLabel={field.label}
                          initialOptions={options}
                          initialPriceModifiers={mods}
                          saving={savingField}
                          onSave={(data) => handleUpdateField(field.id, data)}
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
                  ? formatDate(product.createdAt)
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function FieldEditor({
  mode,
  initialKey = '',
  initialLabel = '',
  initialOptions = [],
  initialPriceModifiers = {},
  saving = false,
  onSave,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initialKey?: string;
  initialLabel?: string;
  initialOptions?: string[];
  initialPriceModifiers?: Record<string, number>;
  saving?: boolean;
  onSave: (data: { key: string; label: string; options: string[]; priceModifiers: Record<string, number> }) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState(initialKey);
  const [label, setLabel] = useState(initialLabel);
  const [optionsText, setOptionsText] = useState(initialOptions.join(', '));
  const [mods, setMods] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const opt of initialOptions) {
      m[opt] = String(initialPriceModifiers[opt] ?? 0);
    }
    return m;
  });

  // Parse current options from text
  const currentOptions = optionsText.split(',').map((o) => o.trim()).filter(Boolean);

  // Sync mods when options change
  function handleOptionsChange(text: string) {
    setOptionsText(text);
    const newOpts = text.split(',').map((o) => o.trim()).filter(Boolean);
    setMods((prev) => {
      const next: Record<string, string> = {};
      for (const opt of newOpts) {
        next[opt] = prev[opt] ?? '0';
      }
      return next;
    });
  }

  function handleSave() {
    if (!key.trim() || !label.trim()) return;
    const priceModifiers: Record<string, number> = {};
    for (const opt of currentOptions) {
      priceModifiers[opt] = Number(mods[opt]) || 0;
    }
    onSave({ key, label, options: currentOptions, priceModifiers });
  }

  return (
    <div className={mode === 'create' ? 'border rounded-lg p-4 space-y-3 bg-gray-50' : 'border-t bg-gray-50 px-4 py-4 space-y-3'}>
      {/* Key + Label */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Clave (key)</label>
          <input
            type="text"
            placeholder="ej: fabric, rizos"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            disabled={mode === 'edit'}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
          <input
            type="text"
            placeholder="ej: Elección del tejido"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Opciones (separadas por coma)
        </label>
        <input
          type="text"
          placeholder="ej: Dacron Newport, Dacron AP, PalmaTec"
          value={optionsText}
          onChange={(e) => handleOptionsChange(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Price modifiers per option */}
      {currentOptions.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-2">
            Precio extra por opción (EUR)
          </label>
          <div className="space-y-1.5">
            {currentOptions.map((opt) => (
              <div key={opt} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-gray-700 truncate">{opt}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">+</span>
                  <input
                    type="number"
                    step="1"
                    value={mods[opt] ?? '0'}
                    onChange={(e) => setMods((prev) => ({ ...prev, [opt]: e.target.value }))}
                    className="w-20 border rounded px-2 py-1 text-sm text-right"
                  />
                  <span className="text-xs text-gray-500">EUR</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || !key.trim() || !label.trim()}
          className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : mode === 'create' ? 'Añadir campo' : 'Guardar cambios'}
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
