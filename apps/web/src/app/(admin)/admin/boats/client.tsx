'use client';

import { useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';

type BoatRow = {
  id: string;
  model: string;
  boatModel: string | null;
  length: string | null;
  isMultihull: boolean | null;
  tenantId: string | null;
  i: string | null;
  j: string | null;
  p: string | null;
  e: string | null;
  createdAt: Date | null;
};

export function BoatsAdminClient({ initialBoats }: { initialBoats: BoatRow[] }) {
  const [boatsList, setBoatsList] = useState(initialBoats);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [newModel, setNewModel] = useState('');
  const [newLength, setNewLength] = useState('');
  const [newMultihull, setNewMultihull] = useState(false);
  const [newP, setNewP] = useState('');
  const [newE, setNewE] = useState('');
  const [newI, setNewI] = useState('');
  const [newJ, setNewJ] = useState('');

  // Edit form
  const [editModel, setEditModel] = useState('');
  const [editLength, setEditLength] = useState('');
  const [editMultihull, setEditMultihull] = useState(false);
  const [editP, setEditP] = useState('');
  const [editE, setEditE] = useState('');
  const [editI, setEditI] = useState('');
  const [editJ, setEditJ] = useState('');

  async function handleCreate() {
    if (!newModel.trim()) return;
    setSaving(true);
    try {
      setError(null);
      const res = await fetch('/api/admin/boats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: newModel, length: newLength || null, isMultihull: newMultihull,
          p: newP || null, e: newE || null, i: newI || null, j: newJ || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      setBoatsList((prev) => [data, ...prev]);
      setNewModel(''); setNewLength(''); setNewMultihull(false);
      setNewP(''); setNewE(''); setNewI(''); setNewJ('');
      setShowCreate(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(boat: BoatRow) {
    setEditingId(boat.id);
    setEditModel(boat.model);
    setEditLength(boat.length || '');
    setEditMultihull(boat.isMultihull || false);
    setEditP(boat.p || '');
    setEditE(boat.e || '');
    setEditI(boat.i || '');
    setEditJ(boat.j || '');
  }

  async function handleSaveEdit() {
    if (!editingId || !editModel.trim()) return;
    setSaving(true);
    try {
      setError(null);
      const res = await fetch(`/api/admin/boats/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: editModel, boatModel: editModel, length: editLength || null, isMultihull: editMultihull,
          p: editP || null, e: editE || null, i: editI || null, j: editJ || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      setBoatsList((prev) => prev.map((b) => b.id === editingId ? { ...b, ...data } : b));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este barco? Esta accion no se puede deshacer.')) return;
    try {
      setError(null);
      const res = await fetch(`/api/admin/boats/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      setBoatsList((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Create button / form */}
      {showCreate ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Nuevo barco global</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Modelo *</label>
              <input type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="ej: BAVARIA 38 CRUISER" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Eslora (m)</label>
              <input type="number" step="0.01" value={newLength} onChange={(e) => setNewLength(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="11.83" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={newMultihull} onChange={(e) => setNewMultihull(e.target.checked)} className="rounded" />
                Multicasco
              </label>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">P (gratil mayor)</label>
              <input type="number" step="0.01" value={newP} onChange={(e) => setNewP(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">E (base mayor)</label>
              <input type="number" step="0.01" value={newE} onChange={(e) => setNewE(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">I (altura proa)</label>
              <input type="number" step="0.01" value={newI} onChange={(e) => setNewI(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">J (base proa)</label>
              <input type="number" step="0.01" value={newJ} onChange={(e) => setNewJ(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !newModel.trim()}
            className="px-5 py-2 bg-[var(--color-accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear barco'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-medium rounded-xl hover:opacity-90"
        >
          <Plus size={16} />
          Nuevo barco
        </button>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">Modelo</th>
                <th className="text-left px-5 py-3 font-medium">Eslora</th>
                <th className="text-left px-5 py-3 font-medium">Tipo</th>
                <th className="text-left px-5 py-3 font-medium">P</th>
                <th className="text-left px-5 py-3 font-medium">E</th>
                <th className="text-left px-5 py-3 font-medium">I</th>
                <th className="text-left px-5 py-3 font-medium">J</th>
                <th className="text-right px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {boatsList.map((boat, idx) => (
                <tr key={boat.id} className={`hover:bg-gray-50 transition-colors ${idx < boatsList.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  {editingId === boat.id ? (
                    <>
                      <td className="px-5 py-2">
                        <input type="text" value={editModel} onChange={(e) => setEditModel(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                      </td>
                      <td className="px-5 py-2">
                        <input type="number" step="0.01" value={editLength} onChange={(e) => setEditLength(e.target.value)}
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                      </td>
                      <td className="px-5 py-2">
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input type="checkbox" checked={editMultihull} onChange={(e) => setEditMultihull(e.target.checked)} className="rounded" />
                          Multi
                        </label>
                      </td>
                      <td className="px-5 py-2"><input type="number" step="0.01" value={editP} onChange={(e) => setEditP(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" /></td>
                      <td className="px-5 py-2"><input type="number" step="0.01" value={editE} onChange={(e) => setEditE(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" /></td>
                      <td className="px-5 py-2"><input type="number" step="0.01" value={editI} onChange={(e) => setEditI(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" /></td>
                      <td className="px-5 py-2"><input type="number" step="0.01" value={editJ} onChange={(e) => setEditJ(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" /></td>
                      <td className="px-5 py-2 text-right space-x-2">
                        <button onClick={handleSaveEdit} disabled={saving} className="text-xs text-green-600 hover:text-green-700 font-medium">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-600">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-gray-700 font-medium">{boat.model}</td>
                      <td className="px-5 py-3 text-gray-500">{boat.length ? `${boat.length}m` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${boat.isMultihull ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                          {boat.isMultihull ? 'Multi' : 'Mono'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{boat.p || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{boat.e || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{boat.i || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{boat.j || '—'}</td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button onClick={() => startEdit(boat)} className="text-xs text-[var(--color-accent)] hover:underline">Editar</button>
                        <button onClick={() => handleDelete(boat.id)} className="text-xs text-red-500 hover:text-red-600">Eliminar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
