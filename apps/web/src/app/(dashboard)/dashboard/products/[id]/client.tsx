'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAIL_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { SaveButton, useSaveState } from '@/components/ui/SaveButton';

type Product = {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  sailType: string;
  basePrice: string | null;
  costPerSqm: string | null;
  currency: string | null;
  descriptionShort: string | null;
  active: boolean | null;
  sortOrder: number | null;
  externalId: string | null;
  createdAt: Date | null;
  [key: string]: unknown;
};

type ConfigField = {
  id: string;
  productId: string;
  key: string;
  label: string;
  fieldType: string | null;
  options: unknown;
  sortOrder: number | null;
  required: boolean | null;
  costModifiers: unknown;
  msrpModifiers: unknown;
  percentModifiers?: unknown;
};

type PricingTier = {
  id: string;
  productId: string;
  minSqm: string;
  maxSqm: string;
  costPerSqm: string;
  msrpPerSqm: string;
  sortOrder: number | null;
};

// Row shape used by the inline editor. `id` is optional for rows not yet persisted.
type TierRow = {
  id?: string;
  minSqm: string;
  maxSqm: string;
  costPerSqm: string;
  msrpPerSqm: string;
};

function tiersToRows(tiers: PricingTier[]): TierRow[] {
  return tiers.map((t) => ({
    id: t.id,
    minSqm: t.minSqm ?? '',
    maxSqm: t.maxSqm ?? '',
    costPerSqm: t.costPerSqm ?? '',
    msrpPerSqm: t.msrpPerSqm ?? '',
  }));
}

export function ProductEditClient({
  product: initialProduct,
  initialFields,
  initialTiers,
}: {
  product: Product;
  initialFields: ConfigField[];
  initialTiers: PricingTier[];
}) {
  const _router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [fields, setFields] = useState(initialFields);
  const { saving, saved, save } = useSaveState();

  const [tierRows, setTierRows] = useState<TierRow[]>(() => tiersToRows(initialTiers));
  const [tierError, setTierError] = useState<string | null>(null);
  const { saving: savingTiers, saved: savedTiers, save: saveTiers } = useSaveState();

  const [name, setName] = useState(product.name);
  const [sailType, setSailType] = useState(product.sailType);
  const [basePrice, setBasePrice] = useState(product.basePrice || '');
  const [costPerSqm, setCostPerSqm] = useState(product.costPerSqm || '');
  const [descriptionShort, setDescriptionShort] = useState(product.descriptionShort || '');
  const [active, setActive] = useState(product.active ?? true);

  const [showAddField, setShowAddField] = useState(false);
  const [_newFieldKey, _setNewFieldKey] = useState('');
  const [_newFieldLabel, _setNewFieldLabel] = useState('');
  const [_newFieldOptions, _setNewFieldOptions] = useState('');
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
          costPerSqm: costPerSqm || null,
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

  async function handleAddField(fieldData: { key: string; label: string; options: string[]; costModifiers: Record<string, number>; msrpModifiers: Record<string, number>; percentModifiers: Record<string, number> }) {
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
          costModifiers: fieldData.costModifiers,
          msrpModifiers: fieldData.msrpModifiers,
          percentModifiers: fieldData.percentModifiers,
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

  async function handleUpdateField(fieldId: string, fieldData: { key: string; label: string; options: string[]; costModifiers: Record<string, number>; msrpModifiers: Record<string, number>; percentModifiers: Record<string, number> }) {
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
          costModifiers: fieldData.costModifiers,
          msrpModifiers: fieldData.msrpModifiers,
          percentModifiers: fieldData.percentModifiers,
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

  function handleAddTierRow() {
    setTierRows((prev) => [
      ...prev,
      { minSqm: '', maxSqm: '', costPerSqm: '', msrpPerSqm: '' },
    ]);
  }

  function handleUpdateTierRow(index: number, patch: Partial<TierRow>) {
    setTierRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleDeleteTierRow(index: number) {
    setTierRows((prev) => prev.filter((_, i) => i !== index));
  }

  function validateTierRows(rows: TierRow[]): string | null {
    for (const [i, r] of rows.entries()) {
      const min = Number(r.minSqm);
      const max = Number(r.maxSqm);
      const cost = Number(r.costPerSqm);
      const msrp = Number(r.msrpPerSqm);
      if (!r.minSqm || !r.maxSqm || !r.costPerSqm || !r.msrpPerSqm) {
        return `Tramo ${i + 1}: todos los campos son obligatorios`;
      }
      if (!isFinite(min) || !isFinite(max) || !isFinite(cost) || !isFinite(msrp)) {
        return `Tramo ${i + 1}: valores numéricos inválidos`;
      }
      if (max <= min) return `Tramo ${i + 1}: m² máx debe ser mayor que m² mín`;
      if (cost < 0 || msrp < 0) return `Tramo ${i + 1}: los precios no pueden ser negativos`;
    }
    const sorted = [...rows].sort((a, b) => Number(a.minSqm) - Number(b.minSqm));
    for (let i = 1; i < sorted.length; i++) {
      if (Number(sorted[i].minSqm) <= Number(sorted[i - 1].maxSqm)) {
        return 'Hay tramos que se solapan';
      }
    }
    return null;
  }

  async function handleSaveTiers() {
    setTierError(null);
    const err = validateTierRows(tierRows);
    if (err) {
      setTierError(err);
      return;
    }
    await saveTiers(async () => {
      const res = await fetch(`/api/internal/products/${product.id}/tiers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiers: tierRows.map((r, idx) => ({
            minSqm: r.minSqm,
            maxSqm: r.maxSqm,
            costPerSqm: r.costPerSqm,
            msrpPerSqm: r.msrpPerSqm,
            sortOrder: idx,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      if (Array.isArray(data)) setTierRows(tiersToRows(data));
    }).catch((e: unknown) => {
      setTierError(e instanceof Error ? e.message : 'Error inesperado');
    });
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
            <div />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Coste base (EUR/m²)</label>
              <input
                type="number"
                step="0.01"
                value={costPerSqm}
                onChange={(e) => setCostPerSqm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="30.00"
              />
              <p className="text-xs text-gray-500 mt-1">Coste interno por m² (fallback fuera de tiers).</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">PVP base (EUR/m²)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="45.00"
              />
              <p className="text-xs text-gray-500 mt-1">PVP / MSRP por m² (fallback fuera de tiers).</p>
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

        <div
          data-testid="product-tiers-section"
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Tiers de precio por m²</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tramos de área (m²) con coste y PVP. Si el área no encaja en ningún tramo,
                se usa el coste base / PVP base del producto.
              </p>
            </div>
            <button
              data-testid="product-tiers-add"
              onClick={handleAddTierRow}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              + Añadir tramo
            </button>
          </div>

          {tierError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              {tierError}
            </div>
          )}

          {tierRows.length === 0 ? (
            <p className="text-sm text-gray-500">No hay tramos definidos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left font-normal py-2 pr-2">m² mín</th>
                    <th className="text-left font-normal py-2 pr-2">m² máx</th>
                    <th className="text-left font-normal py-2 pr-2">Coste (EUR/m²)</th>
                    <th className="text-left font-normal py-2 pr-2">PVP (EUR/m²)</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {tierRows.map((row, index) => (
                    <tr
                      key={index}
                      data-testid={`product-tier-row-${index}`}
                      className="border-b last:border-b-0"
                    >
                      <td className="py-2 pr-2">
                        <input
                          data-testid={`product-tier-min-${index}`}
                          type="number"
                          step="0.01"
                          value={row.minSqm}
                          onChange={(e) => handleUpdateTierRow(index, { minSqm: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          data-testid={`product-tier-max-${index}`}
                          type="number"
                          step="0.01"
                          value={row.maxSqm}
                          onChange={(e) => handleUpdateTierRow(index, { maxSqm: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="20"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          data-testid={`product-tier-cost-${index}`}
                          type="number"
                          step="0.01"
                          value={row.costPerSqm}
                          onChange={(e) => handleUpdateTierRow(index, { costPerSqm: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="30"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          data-testid={`product-tier-msrp-${index}`}
                          type="number"
                          step="0.01"
                          value={row.msrpPerSqm}
                          onChange={(e) => handleUpdateTierRow(index, { msrpPerSqm: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="45"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <button
                          data-testid={`product-tier-delete-${index}`}
                          onClick={() => handleDeleteTierRow(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          aria-label="Eliminar tramo"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-2" data-testid="product-tiers-save">
            <SaveButton
              saving={savingTiers}
              saved={savedTiers}
              onClick={handleSaveTiers}
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
                  const costMods = (field.costModifiers || {}) as Record<string, number>;
                  const msrpMods = (field.msrpModifiers || {}) as Record<string, number>;
                  const percentMods = (field.percentModifiers || {}) as Record<string, number>;
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
                            {(Object.values(msrpMods).some((v) => v > 0) || Object.values(percentMods).some((v) => v > 0)) && (
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
                          initialCostModifiers={costMods}
                          initialMsrpModifiers={msrpMods}
                          initialPercentModifiers={percentMods}
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

        <PricingHelp />
      </div>
    </div>
  );
}

function FieldEditor({
  mode,
  initialKey = '',
  initialLabel = '',
  initialOptions = [],
  initialCostModifiers = {},
  initialMsrpModifiers = {},
  initialPercentModifiers = {},
  saving = false,
  onSave,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initialKey?: string;
  initialLabel?: string;
  initialOptions?: string[];
  initialCostModifiers?: Record<string, number>;
  initialMsrpModifiers?: Record<string, number>;
  initialPercentModifiers?: Record<string, number>;
  saving?: boolean;
  onSave: (data: { key: string; label: string; options: string[]; costModifiers: Record<string, number>; msrpModifiers: Record<string, number>; percentModifiers: Record<string, number> }) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState(initialKey);
  const [label, setLabel] = useState(initialLabel);
  const [optionsText, setOptionsText] = useState(initialOptions.join(', '));
  const [modType, setModType] = useState<Record<string, 'eur' | 'percent'>>(() => {
    const m: Record<string, 'eur' | 'percent'> = {};
    for (const opt of initialOptions) {
      const pct = Number(initialPercentModifiers[opt] ?? 0);
      m[opt] = pct !== 0 ? 'percent' : 'eur';
    }
    return m;
  });
  const [modCost, setModCost] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const opt of initialOptions) m[opt] = String(initialCostModifiers[opt] ?? 0);
    return m;
  });
  const [modMsrp, setModMsrp] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const opt of initialOptions) m[opt] = String(initialMsrpModifiers[opt] ?? 0);
    return m;
  });
  const [modPercent, setModPercent] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const opt of initialOptions) m[opt] = String(initialPercentModifiers[opt] ?? 0);
    return m;
  });

  // Parse current options from text, deduplicating while preserving first-seen order.
  const rawOptions = optionsText.split(',').map((o) => o.trim()).filter(Boolean);
  const currentOptions = Array.from(new Set(rawOptions));
  const duplicateOptions = Array.from(new Set(rawOptions.filter((o, i) => rawOptions.indexOf(o) !== i)));

  // Sync mods when options change
  function handleOptionsChange(text: string) {
    setOptionsText(text);
    const newOpts = text.split(',').map((o) => o.trim()).filter(Boolean);
    setModType((prev) => {
      const next: Record<string, 'eur' | 'percent'> = {};
      for (const opt of newOpts) {
        next[opt] = prev[opt] ?? 'eur';
      }
      return next;
    });
    const pruneStrings = (prev: Record<string, string>) => {
      const next: Record<string, string> = {};
      for (const opt of newOpts) next[opt] = prev[opt] ?? '0';
      return next;
    };
    setModCost(pruneStrings);
    setModMsrp(pruneStrings);
    setModPercent(pruneStrings);
  }

  function handleSave() {
    if (!key.trim() || !label.trim()) return;
    const costModifiers: Record<string, number> = {};
    const msrpModifiers: Record<string, number> = {};
    const percentModifiers: Record<string, number> = {};
    for (const opt of currentOptions) {
      if (modType[opt] === 'percent') {
        percentModifiers[opt] = Number(modPercent[opt]) || 0;
        costModifiers[opt] = 0;
        msrpModifiers[opt] = 0;
      } else {
        costModifiers[opt] = Number(modCost[opt]) || 0;
        msrpModifiers[opt] = Number(modMsrp[opt]) || 0;
        percentModifiers[opt] = 0;
      }
    }
    onSave({ key, label, options: currentOptions, costModifiers, msrpModifiers, percentModifiers });
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
          className={`w-full border rounded-lg px-3 py-2 text-sm ${duplicateOptions.length > 0 ? 'border-amber-400 focus:ring-amber-300' : ''}`}
        />
        {duplicateOptions.length > 0 && (
          <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Se ignoran opciones duplicadas: {duplicateOptions.map((o) => `"${o}"`).join(', ')}. Cada opción debe ser única.
          </p>
        )}
      </div>

      {/* Price modifiers per option */}
      {currentOptions.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-2">
            Modificador por opción (fijo en EUR o porcentaje)
          </label>
          <div className="space-y-1.5">
            {currentOptions.map((opt) => {
              const type = modType[opt] ?? 'eur';
              return (
                <div key={opt} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-gray-700 truncate">{opt}</span>
                  <div className="inline-flex rounded border border-gray-200 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setModType((prev) => ({ ...prev, [opt]: 'eur' }))}
                      className={`px-2 py-1 ${type === 'eur' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      EUR
                    </button>
                    <button
                      type="button"
                      onClick={() => setModType((prev) => ({ ...prev, [opt]: 'percent' }))}
                      className={`px-2 py-1 ${type === 'percent' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      %
                    </button>
                  </div>
                  {type === 'eur' ? (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Coste</span>
                        <input
                          type="number"
                          step="1"
                          value={modCost[opt] ?? '0'}
                          onChange={(e) => setModCost((prev) => ({ ...prev, [opt]: e.target.value }))}
                          className="w-20 border rounded px-2 py-1 text-sm text-right text-gray-900"
                        />
                        <span className="text-gray-400">€</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <span>PVP</span>
                        <input
                          type="number"
                          step="1"
                          value={modMsrp[opt] ?? '0'}
                          onChange={(e) => setModMsrp((prev) => ({ ...prev, [opt]: e.target.value }))}
                          className="w-20 border rounded px-2 py-1 text-sm text-right text-gray-900"
                        />
                        <span className="text-gray-400">€</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        value={modPercent[opt] ?? '0'}
                        onChange={(e) => setModPercent((prev) => ({ ...prev, [opt]: e.target.value }))}
                        className="w-20 border rounded px-2 py-1 text-sm text-right text-gray-900"
                      />
                      <span className="text-xs text-gray-500 w-6">%</span>
                    </div>
                  )}
                </div>
              );
            })}
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

function PricingHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-blue-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-blue-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          ¿Cómo se calculan los precios?
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-blue-900 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 text-sm text-gray-700">
          <section>
            <h4 className="font-semibold text-gray-900 mb-1.5">1. Coste base y PVP base</h4>
            <p>
              Cada producto tiene un <strong>Coste base (EUR/m²)</strong> y un <strong>PVP base (EUR/m²)</strong>.
              Son los valores por defecto que se usan cuando un pedido no encaja en ningún tier.
            </p>
          </section>
          <section>
            <h4 className="font-semibold text-gray-900 mb-1.5">2. Tiers por rango de m² (opcional)</h4>
            <p>
              Los tiers permiten definir precios distintos según el tamaño. Ejemplo:
            </p>
            <ul className="list-disc ml-5 mt-1 space-y-0.5 text-gray-600">
              <li>0–20 m²: 150 €/m² coste, 200 €/m² PVP</li>
              <li>20–40 m²: 120 €/m² coste, 170 €/m² PVP</li>
              <li>40–60 m²: 100 €/m² coste, 150 €/m² PVP</li>
            </ul>
            <p className="mt-2 text-gray-600">
              Si el pedido cae en un rango, se usa ese tier. Si no cae en ninguno, cae al base.
              <strong> No hay interpolación</strong> entre tiers — define rangos contiguos sin huecos.
            </p>
          </section>
          <section>
            <h4 className="font-semibold text-gray-900 mb-1.5">3. Modificadores por opción</h4>
            <p>
              Cada opción de los campos de configuración puede añadir un <strong>extra en EUR</strong> (fijo)
              <strong> o</strong> un <strong>porcentaje %</strong> — nunca ambos.
            </p>
            <ul className="list-disc ml-5 mt-1 space-y-0.5 text-gray-600">
              <li>
                <strong>EUR fijo</strong>: define dos valores <em>independientes</em> por opción —
                <strong> Coste (+€)</strong> lo que te cuesta a ti y <strong> PVP (+€)</strong> lo que cobras al cliente.
                Si son iguales, el extra se repasa sin margen; si el PVP es mayor, te llevas la diferencia.
              </li>
              <li>
                <strong>%</strong>: multiplica por <code>(1 + %)</code> al final, sobre coste y PVP por igual
                (ej. <em>rizos +10%</em>). Preserva el margen proporcional y lo escala.
              </li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold text-gray-900 mb-1.5">4. Fórmula final</h4>
            <pre className="bg-white border border-gray-200 rounded px-3 py-2 text-xs font-mono overflow-x-auto">
coste = (m² × costPerSqm + Σ Coste(+€)) × (1 + Σ %)
PVP   = (m² × msrpPerSqm + Σ PVP(+€))   × (1 + Σ %)
            </pre>
            <p className="mt-2 text-gray-600">
              Donde <code className="text-xs bg-white border border-gray-200 rounded px-1">costPerSqm</code> y <code className="text-xs bg-white border border-gray-200 rounded px-1">msrpPerSqm</code> son los valores del tier si el m² matchea, o los del base en caso contrario.
              El mismo <code className="text-xs bg-white border border-gray-200 rounded px-1">%</code> multiplica ambas columnas, así que el ratio de margen se conserva.
            </p>
          </section>
          <section>
            <h4 className="font-semibold text-gray-900 mb-1.5">5. Ejemplo</h4>
            <p className="text-gray-600">
              Vela de 30 m², tier [20–40] a 120 € coste / 170 € PVP, extra <em>color premium</em>
              con <strong>Coste +80 €</strong> y <strong>PVP +120 €</strong> (40 € de margen bookado),
              más opción rizos <strong>+10%</strong>:
            </p>
            <table className="mt-2 w-full text-xs border border-gray-200 rounded overflow-hidden">
              <thead className="bg-white">
                <tr className="text-left">
                  <th className="px-2 py-1 border-b border-gray-200">Concepto</th>
                  <th className="px-2 py-1 border-b border-gray-200">Coste</th>
                  <th className="px-2 py-1 border-b border-gray-200">PVP</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="px-2 py-1 border-b border-gray-100">m² × perSqm</td>
                  <td className="px-2 py-1 border-b border-gray-100">30 × 120 = 3.600 €</td>
                  <td className="px-2 py-1 border-b border-gray-100">30 × 170 = 5.100 €</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border-b border-gray-100">+ extra color</td>
                  <td className="px-2 py-1 border-b border-gray-100">+ 80 = 3.680 €</td>
                  <td className="px-2 py-1 border-b border-gray-100">+ 120 = 5.220 €</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">× (1 + 10%)</td>
                  <td className="px-2 py-1">× 1.10 = <strong>4.048 €</strong></td>
                  <td className="px-2 py-1">× 1.10 = <strong>5.742 €</strong></td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-gray-500 text-xs">
              El cliente paga <strong>5.742 €</strong>. Tu margen: 5.742 − 4.048 = <strong>1.694 €</strong>
              (vs. 1.650 € si no bookaras margen en el extra).
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
