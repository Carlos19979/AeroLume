'use client';

import { useState } from 'react';

type ThemeData = {
  themeAccent: string | null;
  themeAccentDim: string | null;
  themeNavy: string | null;
  themeText: string | null;
  themeFontDisplay: string | null;
  themeFontBody: string | null;
  themeColorMain: string | null;
  themeColorHead: string | null;
  themeColorSpi: string | null;
  logoUrl: string | null;
};

const DEFAULTS: ThemeData = {
  themeAccent: '#0b5faa',
  themeAccentDim: '#1a7fd4',
  themeNavy: '#0a2540',
  themeText: '#0a1e3d',
  themeFontDisplay: 'Cormorant',
  themeFontBody: 'Manrope',
  themeColorMain: '#3b82f6',
  themeColorHead: '#10b981',
  themeColorSpi: '#a855f7',
  logoUrl: null,
};

const FONT_OPTIONS = ['Cormorant', 'Playfair Display', 'Libre Baskerville', 'Lora', 'Merriweather', 'Georgia'];
const BODY_FONT_OPTIONS = ['Manrope', 'Inter', 'Open Sans', 'Roboto', 'Lato', 'Source Sans 3'];

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function ThemeClient({ initialTheme }: { initialTheme: ThemeData }) {
  const [theme, setTheme] = useState<ThemeData>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewStep, setPreviewStep] = useState<1 | 2>(1);

  function updateField(key: keyof ThemeData, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  function resetMainColors() {
    setTheme((prev) => ({
      ...prev,
      themeAccent: DEFAULTS.themeAccent,
      themeAccentDim: DEFAULTS.themeAccentDim,
      themeNavy: DEFAULTS.themeNavy,
      themeText: DEFAULTS.themeText,
    }));
  }

  function resetGroupColors() {
    setTheme((prev) => ({
      ...prev,
      themeColorMain: DEFAULTS.themeColorMain,
      themeColorHead: DEFAULTS.themeColorHead,
      themeColorSpi: DEFAULTS.themeColorSpi,
    }));
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

  const accent = theme.themeAccent || DEFAULTS.themeAccent!;
  const navy = theme.themeNavy || DEFAULTS.themeNavy!;
  const text = theme.themeText || DEFAULTS.themeText!;
  const colorMain = theme.themeColorMain || DEFAULTS.themeColorMain!;
  const colorHead = theme.themeColorHead || DEFAULTS.themeColorHead!;
  const colorSpi = theme.themeColorSpi || DEFAULTS.themeColorSpi!;
  const fontDisplay = theme.themeFontDisplay || DEFAULTS.themeFontDisplay!;
  const fontBody = theme.themeFontBody || DEFAULTS.themeFontBody!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Editor ── */}
      <div className="space-y-6">
        {/* Main colors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Colores principales</h3>
            <button onClick={resetMainColors} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Resetear
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Color principal" value={accent} onChange={(v) => updateField('themeAccent', v)} />
            <ColorField label="Color secundario" value={theme.themeAccentDim || DEFAULTS.themeAccentDim!} onChange={(v) => updateField('themeAccentDim', v)} />
            <ColorField label="Navy (fondo)" value={navy} onChange={(v) => updateField('themeNavy', v)} />
            <ColorField label="Texto" value={text} onChange={(v) => updateField('themeText', v)} />
          </div>
        </div>

        {/* Sail group colors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Colores del configurador</h3>
              <p className="text-xs text-gray-400 mt-0.5">Un color por grupo de vela en el widget.</p>
            </div>
            <button onClick={resetGroupColors} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Resetear
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ColorField label="Vela mayor" value={colorMain} onChange={(v) => updateField('themeColorMain', v)} />
            <ColorField label="Vela de proa" value={colorHead} onChange={(v) => updateField('themeColorHead', v)} />
            <ColorField label="Portantes" value={colorSpi} onChange={(v) => updateField('themeColorSpi', v)} />
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Fuentes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Titulos</label>
              <select value={fontDisplay} onChange={(e) => updateField('themeFontDisplay', e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Cuerpo</label>
              <select value={fontBody} onChange={(e) => updateField('themeFontBody', e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
                {BODY_FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Logo</h3>
          <input
            type="url"
            value={theme.logoUrl || ''}
            onChange={(e) => updateField('logoUrl', e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm"
            placeholder="https://tu-web.com/logo.svg"
          />
          {theme.logoUrl && (
            <div className="border rounded-xl p-4 bg-gray-50 flex items-center justify-center">
              <img src={theme.logoUrl} alt="Logo" className="max-h-12 object-contain" />
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ backgroundColor: accent }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="text-sm text-green-600 self-center">Guardado</span>}
        </div>
      </div>

      {/* ── Preview ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Vista previa</h3>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewStep(1)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${previewStep === 1 ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Paso 1
            </button>
            <button
              onClick={() => setPreviewStep(2)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${previewStep === 2 ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Paso 2
            </button>
          </div>
        </div>

        {/* Browser chrome */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md border border-gray-200 px-3 py-1 text-[10px] text-gray-400 text-center">tuveleria.com/configurador</div>
            </div>
          </div>

          {/* Widget content */}
          <div className="bg-white p-5" style={{ fontFamily: fontBody }}>
            {/* Header */}
            <div className="text-center mb-4">
              {theme.logoUrl && <img src={theme.logoUrl} alt="Logo" className="h-6 mx-auto mb-1.5 object-contain" />}
              <p className="text-base font-bold" style={{ color: text, fontFamily: fontDisplay }}>Configurador de Velas</p>
              <p className="text-[10px]" style={{ color: `${text}60` }}>por Tu Veleria</p>
            </div>

            {/* Stepper */}
            <div className="flex justify-center gap-1 mb-4">
              {['Barco', 'Vela', 'Opciones', 'Contacto'].map((label, i) => (
                <span
                  key={label}
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-medium"
                  style={
                    (previewStep === 1 && i === 0) || (previewStep === 2 && i <= 1)
                      ? { backgroundColor: accent, color: '#fff' }
                      : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                  }
                >
                  {(previewStep === 2 && i === 0) ? '✓' : ''} {label}
                </span>
              ))}
            </div>

            {/* Step 1: Search */}
            {previewStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: `${navy}08` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`${text}50`} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <span className="text-xs" style={{ color: `${text}40` }}>Busca tu barco...</span>
                </div>
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${accent}15` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5"><path d="M12 2L4 20h16L12 2z" opacity="0.2" fill={accent} /><path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" /></svg>
                  </div>
                  <p className="text-xs" style={{ color: `${text}50` }}>Empieza buscando tu barco</p>
                </div>
                {/* Sample result */}
                <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {['BAVARIA 38 CRUISER', 'BENETEAU FIRST 40'].map((name) => (
                    <div key={name} className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-xs font-medium" style={{ color: text }}>{name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ backgroundColor: `${navy}08`, color: `${text}60` }}>11.8m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Products */}
            {previewStep === 2 && (
              <div className="space-y-4">
                {/* Boat pill */}
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: `${accent}12`, color: accent }}>BAVARIA 38 · 11.83m</span>
                </div>

                {/* Mayor group */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${colorMain}18` }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colorMain} strokeWidth="2"><path d="M12 2L4 20h16L12 2z" opacity="0.2" fill={colorMain} /><path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-700" style={{ color: text }}>Vela mayor</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Mayor Clasica', 'Mayor Full Batten'].map((name, i) => (
                      <div
                        key={name}
                        className="rounded-xl p-3 border"
                        style={{
                          background: `linear-gradient(135deg, rgba(${hexToRgb(colorMain)}, 0.04), transparent)`,
                          borderColor: `rgba(${hexToRgb(colorMain)}, 0.12)`,
                        }}
                      >
                        <p className="text-[10px] font-semibold text-gray-900" style={{ color: text }}>{name}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: colorMain }}>25.9 m²</p>
                        <p className="text-xs font-bold mt-1" style={{ color: accent }}>{[1165, 1188][i]} EUR</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proa group */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${colorHead}18` }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colorHead} strokeWidth="2"><path d="M12 2L4 20h16L12 2z" opacity="0.2" fill={colorHead} /><path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-700" style={{ color: text }}>Vela de proa</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Genova Enrollable', 'Genova Mosquetones'].map((name, i) => (
                      <div
                        key={name}
                        className="rounded-xl p-3 border"
                        style={{
                          background: `linear-gradient(135deg, rgba(${hexToRgb(colorHead)}, 0.04), transparent)`,
                          borderColor: `rgba(${hexToRgb(colorHead)}, 0.12)`,
                        }}
                      >
                        <p className="text-[10px] font-semibold text-gray-900" style={{ color: text }}>{name}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: colorHead }}>31.8 m²</p>
                        <p className="text-xs font-bold mt-1" style={{ color: accent }}>{[1336, 1398][i]} EUR</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portantes group */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${colorSpi}18` }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colorSpi} strokeWidth="2"><path d="M12 2L4 20h16L12 2z" opacity="0.2" fill={colorSpi} /><path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-700" style={{ color: text }}>Portantes</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Spi Asimetrico', 'Code S'].map((name, i) => (
                      <div
                        key={name}
                        className="rounded-xl p-3 border"
                        style={{
                          background: `linear-gradient(135deg, rgba(${hexToRgb(colorSpi)}, 0.04), transparent)`,
                          borderColor: `rgba(${hexToRgb(colorSpi)}, 0.12)`,
                        }}
                      >
                        <p className="text-[10px] font-semibold text-gray-900" style={{ color: text }}>{name}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: colorSpi }}>69.1 m²</p>
                        <p className="text-xs font-bold mt-1" style={{ color: accent }}>{[2626, 3317][i]} EUR</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <span className="text-[9px] text-gray-300">Powered by <span style={{ color: accent }}>Aerolume</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded-lg border cursor-pointer" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs font-mono" placeholder="#000000" />
      </div>
    </div>
  );
}
