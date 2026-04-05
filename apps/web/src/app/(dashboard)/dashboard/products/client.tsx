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

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sailType: string;
  basePrice: string | null;
  currency: string | null;
  active: boolean | null;
  sortOrder: number | null;
  createdAt: Date | null;
};

export function ProductsClient({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [productsList, setProductsList] = useState(initialProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSailType, setNewSailType] = useState('gvstd');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);

    const res = await fetch('/api/internal/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, sailType: newSailType }),
    });
    const { data } = await res.json();

    setProductsList((prev) => [...prev, data]);
    setNewName('');
    setShowCreate(false);
    setLoading(false);
  }

  async function handleToggleActive(id: string, currentActive: boolean | null) {
    const newActive = !currentActive;
    await fetch(`/api/internal/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newActive }),
    });
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: newActive } : p))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    await fetch(`/api/internal/products/${id}`, { method: 'DELETE' });
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      {showCreate ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Nuevo producto</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <select
              value={newSailType}
              onChange={(e) => setNewSailType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              {Object.entries(SAIL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90"
        >
          + Nuevo producto
        </button>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {productsList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tienes productos. Crea uno para empezar.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo de vela</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Precio/m²</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productsList.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      className="text-gray-900 hover:text-[var(--color-accent)] font-medium"
                    >
                      {product.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                      {SAIL_TYPE_LABELS[product.sailType] || product.sailType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.basePrice
                      ? `${Number(product.basePrice).toFixed(0)} ${product.currency || 'EUR'}/m²`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(product.id, product.active)}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => handleToggleActive(product.id, product.active)}
                      className="text-xs text-gray-500 hover:text-gray-600"
                    >
                      {product.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      className="text-[var(--color-accent)] hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
