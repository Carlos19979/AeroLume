'use client';

import { useState } from 'react';

type ThemeData = {
  themeAccent: string | null;
  themeAccentDim: string | null;
  themeNavy: string | null;
  themeText: string | null;
  themeFontDisplay: string | null;
  themeFontBody: string | null;
  logoUrl: string | null;
};

const FONT_OPTIONS = [
  'Cormorant',
  'Playfair Display',
  'Libre Baskerville',
  'Lora',
  'Merriweather',
  'Georgia',
];

const BODY_FONT_OPTIONS = [
  'Manrope',
  'Inter',
  'Open Sans',
  'Roboto',
  'Lato',
  'Source Sans 3',
];

export function ThemeClient({ initialTheme }: { initialTheme: ThemeData }) {
  const [theme, setTheme] = useState<ThemeData>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField(key: keyof ThemeData, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/internal/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    const { data } = await res.json();
    if (data) setTheme(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-6">
        {/* Colors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Colores</h3>

          <div className="grid grid-cols-2 gap-4">
            <ColorField
              label="Color principal"
              value={theme.themeAccent || '#0b5faa'}
              onChange={(v) => updateField('themeAccent', v)}
            />
            <ColorField
              label="Color principal (dim)"
              value={theme.themeAccentDim || '#1a7fd4'}
              onChange={(v) => updateField('themeAccentDim', v)}
            />
            <ColorField
              label="Navy (fondo oscuro)"
              value={theme.themeNavy || '#0a2540'}
              onChange={(v) => updateField('themeNavy', v)}
            />
            <ColorField
              label="Texto principal"
              value={theme.themeText || '#0a1e3d'}
              onChange={(v) => updateField('themeText', v)}
            />
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Fuentes</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Fuente de títulos</label>
            <select
              value={theme.themeFontDisplay || 'Cormorant'}
              onChange={(e) => updateField('themeFontDisplay', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Fuente de cuerpo</label>
            <select
              value={theme.themeFontBody || 'Manrope'}
              onChange={(e) => updateField('themeFontBody', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {BODY_FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Logo</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">URL del logo</label>
            <input
              type="url"
              value={theme.logoUrl || ''}
              onChange={(e) => updateField('logoUrl', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://tu-web.com/logo.svg"
            />
          </div>
          {theme.logoUrl && (
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
              <img
                src={theme.logoUrl}
                alt="Logo preview"
                className="max-h-16 object-contain"
              />
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="text-sm text-green-600 self-center">Guardado</span>}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Vista previa</h3>
        <div
          className="rounded-xl border border-gray-200 overflow-hidden"
          style={{
            '--preview-accent': theme.themeAccent || '#0b5faa',
            '--preview-navy': theme.themeNavy || '#0a2540',
            '--preview-text': theme.themeText || '#0a1e3d',
          } as React.CSSProperties}
        >
          {/* Widget header preview */}
          <div
            className="px-6 py-4 text-white text-center"
            style={{ backgroundColor: 'var(--preview-navy)' }}
          >
            {theme.logoUrl && (
              <img src={theme.logoUrl} alt="Logo" className="h-8 mx-auto mb-2 object-contain" />
            )}
            <h4
              className="text-lg font-semibold"
              style={{ fontFamily: theme.themeFontDisplay || 'Cormorant' }}
            >
              Configurador de Velas
            </h4>
          </div>

          {/* Widget body preview */}
          <div className="p-6 bg-white space-y-4">
            <p
              className="text-sm"
              style={{
                color: 'var(--preview-text)',
                fontFamily: theme.themeFontBody || 'Manrope',
              }}
            >
              Busca tu barco y configura las velas a medida.
            </p>

            <div className="border rounded-lg px-4 py-3 text-sm text-gray-400">
              Busca tu barco...
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-white text-sm rounded-lg"
                style={{ backgroundColor: 'var(--preview-accent)' }}
              >
                Buscar
              </button>
              <button className="px-4 py-2 text-sm rounded-lg border text-gray-600">
                Cancelar
              </button>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'var(--preview-text)' }}>
                  Mayor Clásica Horizontal
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--preview-accent)' }}>
                  desde 850 EUR
                </span>
              </div>
              <p className="text-xs text-gray-400">Equilibrada para crucero y uso general.</p>
            </div>
          </div>

          <div className="px-6 py-3 bg-gray-50 text-center">
            <span className="text-xs text-gray-300">
              Powered by <span style={{ color: 'var(--preview-accent)' }}>Aerolume</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
