'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { SaveButton, useSaveState } from '@/components/ui/SaveButton';
import { EmbedConfigurator } from '@/app/embed/configurator';

type EmbedStep = 'boat' | 'products' | 'configure' | 'preview' | 'contact';

const STEP_MAP: Record<1 | 2 | 3 | 4 | 5, EmbedStep> = {
  1: 'boat',
  2: 'products',
  3: 'configure',
  4: 'preview',
  5: 'contact',
};

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
  themeCtaLabel: string | null;
  themeContactTitle: string | null;
  themeContactSubtitle: string | null;
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
  themeCtaLabel: 'Solicitar presupuesto',
  themeContactTitle: 'Datos de contacto',
  themeContactSubtitle: 'Para enviarte el presupuesto detallado.',
  logoUrl: null,
};

const FONT_OPTIONS = ['Cormorant', 'Playfair Display', 'Libre Baskerville', 'Lora', 'Merriweather', 'Georgia'];
const BODY_FONT_OPTIONS = ['Manrope', 'Inter', 'Open Sans', 'Roboto', 'Lato', 'Source Sans 3'];

export function ThemeClient({ initialTheme }: { initialTheme: ThemeData }) {
  const [theme, setTheme] = useState<ThemeData>(initialTheme);
  const { saving, saved, save } = useSaveState();
  const [previewStep, setPreviewStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [error, setError] = useState<string | null>(null);

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

  function resetCopy() {
    setTheme((prev) => ({
      ...prev,
      themeCtaLabel: DEFAULTS.themeCtaLabel,
      themeContactTitle: DEFAULTS.themeContactTitle,
      themeContactSubtitle: DEFAULTS.themeContactSubtitle,
    }));
  }

  async function handleSave() {
    await save(async () => {
      setError(null);
      const res = await fetch('/api/internal/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      if (data) setTheme(data);
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    });
  }

  const accent = theme.themeAccent || DEFAULTS.themeAccent!;
  const navy = theme.themeNavy || DEFAULTS.themeNavy!;
  const text = theme.themeText || DEFAULTS.themeText!;
  const colorMain = theme.themeColorMain || DEFAULTS.themeColorMain!;
  const colorHead = theme.themeColorHead || DEFAULTS.themeColorHead!;
  const colorSpi = theme.themeColorSpi || DEFAULTS.themeColorSpi!;
  const fontDisplay = theme.themeFontDisplay || DEFAULTS.themeFontDisplay!;
  const fontBody = theme.themeFontBody || DEFAULTS.themeFontBody!;
  const ctaLabel = theme.themeCtaLabel || DEFAULTS.themeCtaLabel!;
  const contactTitle = theme.themeContactTitle || DEFAULTS.themeContactTitle!;
  const contactSubtitle = theme.themeContactSubtitle || DEFAULTS.themeContactSubtitle!;

  // Tenant snapshot for the embedded configurator preview — reflects live edits
  // on every render so the user sees color/font/copy changes instantly.
  const previewTenant = useMemo(
    () => ({
      id: 'preview',
      name: 'Tu Veleria',
      slug: 'preview',
      themeAccent: accent,
      themeAccentDim: theme.themeAccentDim || DEFAULTS.themeAccentDim!,
      themeNavy: navy,
      themeText: text,
      themeFontDisplay: fontDisplay,
      themeFontBody: fontBody,
      themeColorMain: colorMain,
      themeColorHead: colorHead,
      themeColorSpi: colorSpi,
      themeCtaLabel: ctaLabel,
      themeContactTitle: contactTitle,
      themeContactSubtitle: contactSubtitle,
      logoUrl: theme.logoUrl,
      locale: 'es',
      currency: 'EUR',
    }),
    [
      accent,
      theme.themeAccentDim,
      navy,
      text,
      fontDisplay,
      fontBody,
      colorMain,
      colorHead,
      colorSpi,
      ctaLabel,
      contactTitle,
      contactSubtitle,
      theme.logoUrl,
    ],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Editor ── */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Main colors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Colores principales</h3>
            <button onClick={resetMainColors} className="text-xs text-gray-500 hover:text-gray-600 transition-colors">
              Resetear
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div data-testid="theme-accent-picker"><ColorField label="Color principal" value={accent} onChange={(v) => updateField('themeAccent', v)} testid="theme-accent-hex" /></div>
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
              <p className="text-xs text-gray-500 mt-0.5">Un color por grupo de vela en el widget.</p>
            </div>
            <button onClick={resetGroupColors} className="text-xs text-gray-500 hover:text-gray-600 transition-colors">
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
              <Image src={theme.logoUrl} alt="Logo" width={192} height={48} unoptimized className="max-h-12 w-auto object-contain" />
            </div>
          )}
        </div>

        {/* Textos del configurador */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Textos del configurador</h3>
              <p className="text-xs text-gray-500 mt-0.5">Etiqueta del boton y titulos de la pantalla de contacto.</p>
            </div>
            <button onClick={resetCopy} className="text-xs text-gray-500 hover:text-gray-600 transition-colors">
              Resetear
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Texto del boton final (CTA)</label>
              <input
                type="text"
                data-testid="theme-cta-label"
                value={theme.themeCtaLabel ?? ''}
                onChange={(e) => updateField('themeCtaLabel', e.target.value)}
                maxLength={100}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="Solicitar presupuesto"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Titulo de la pantalla de contacto</label>
              <input
                type="text"
                data-testid="theme-contact-title"
                value={theme.themeContactTitle ?? ''}
                onChange={(e) => updateField('themeContactTitle', e.target.value)}
                maxLength={150}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="Datos de contacto"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Subtitulo de la pantalla de contacto</label>
              <textarea
                data-testid="theme-contact-subtitle"
                value={theme.themeContactSubtitle ?? ''}
                onChange={(e) => updateField('themeContactSubtitle', e.target.value)}
                maxLength={300}
                rows={2}
                className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
                placeholder="Para enviarte el presupuesto detallado."
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div data-testid="theme-save">
          <SaveButton
            saving={saving}
            saved={saved}
            onClick={handleSave}
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          />
        </div>
      </div>

      {/* ── Preview ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Vista previa</h3>
          <div className="flex bg-gray-100 rounded-lg p-0.5 flex-wrap">
            {([
              { n: 1 as const, label: 'Paso 1' },
              { n: 2 as const, label: 'Paso 2' },
              { n: 3 as const, label: 'Opciones' },
              { n: 4 as const, label: 'Vista previa' },
              { n: 5 as const, label: 'Contacto' },
            ]).map(({ n, label }) => (
              <button
                key={n}
                data-testid={`theme-preview-step-${n}`}
                onClick={() => setPreviewStep(n)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${previewStep === n ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Vista previa del widget real. Los cambios se aplican al instante.
        </p>

        {/* Browser chrome wrapping the real EmbedConfigurator in preview mode */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md border border-gray-200 px-3 py-1 text-[10px] text-gray-500 text-center">tuveleria.com/configurador</div>
            </div>
          </div>

          {/* Live EmbedConfigurator — remount on step change so the internal
              step state picks up the new initial step from previewMode. */}
          <div className="bg-white">
            <EmbedConfigurator
              key={previewStep}
              apiKey=""
              tenant={previewTenant}
              previewMode={{ step: STEP_MAP[previewStep] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange, testid }: { label: string; value: string; onChange: (v: string) => void; testid?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded-lg border cursor-pointer" />
        <input type="text" data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs font-mono" placeholder="#000000" />
      </div>
    </div>
  );
}
