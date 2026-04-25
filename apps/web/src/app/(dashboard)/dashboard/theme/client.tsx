'use client';

import { useMemo, useState } from 'react';
import { SaveButton, useSaveState } from '@/components/ui/SaveButton';
import { EmbedConfigurator } from '@/app/embed/configurator';
import { TEMPLATE_PRESETS } from '@/app/embed/templates/presets';
import { TEMPLATE_FIELD_LABELS } from '@/app/embed/templates/field-labels';
import { TEMPLATE_COPY_DEFAULTS, type StepKey, type TemplateCopy } from '@/app/embed/templates/copy';

type EmbedStep = 'boat' | 'products' | 'configure' | 'preview' | 'contact';

const STEP_MAP: Record<1 | 2 | 3 | 4 | 5, EmbedStep> = {
  1: 'boat',
  2: 'products',
  3: 'configure',
  4: 'preview',
  5: 'contact',
};

type ThemeTemplate = 'minimal' | 'editorial' | 'premium' | 'marine';

type ThemeData = {
  themeTemplate: ThemeTemplate | null;
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
  themeCopy: TemplateCopy | null;
  logoUrl: string | null;
};

const DEFAULTS: ThemeData = {
  themeTemplate: 'minimal',
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
  themeCopy: {},
  logoUrl: null,
};

const STEP_KEYS: { key: StepKey; label: string }[] = [
  { key: 'boat', label: '1 · Barco' },
  { key: 'products', label: '2 · Vela' },
  { key: 'configure', label: '3 · Opciones' },
  { key: 'preview', label: '4 · Vista previa' },
  { key: 'contact', label: '5 · Contacto' },
];

const TEMPLATES: { key: ThemeTemplate; label: string; mood: string; available: boolean }[] = [
  { key: 'minimal', label: 'Minimal', mood: 'Limpio · sans · grid', available: true },
  { key: 'editorial', label: 'Editorial náutico', mood: 'Serif · crema · hairline', available: true },
  { key: 'premium', label: 'Premium oscuro', mood: 'Navy · dorado · glass', available: true },
  { key: 'marine', label: 'Marine bold', mood: 'Color · redondeo · friendly', available: true },
];

const FONT_OPTIONS = ['Cormorant', 'Fraunces', 'Playfair Display', 'Libre Baskerville', 'Lora', 'Merriweather', 'Georgia', 'Inter', 'Manrope'];
const BODY_FONT_OPTIONS = ['Inter', 'Manrope', 'Open Sans', 'Roboto', 'Lato', 'Source Sans 3'];

export function ThemeClient({ initialTheme }: { initialTheme: ThemeData }) {
  const [theme, setTheme] = useState<ThemeData>(initialTheme);
  const { saving, saved, save } = useSaveState();
  const [previewStep, setPreviewStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof ThemeData, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  function applyTemplatePreset(next: ThemeTemplate) {
    const preset = TEMPLATE_PRESETS[next];
    setTheme((prev) => ({
      ...prev,
      themeTemplate: next,
      themeAccent: preset.themeAccent,
      themeAccentDim: preset.themeAccentDim,
      themeNavy: preset.themeNavy,
      themeText: preset.themeText,
      themeFontDisplay: preset.themeFontDisplay,
      themeFontBody: preset.themeFontBody,
      themeColorMain: preset.themeColorMain,
      themeColorHead: preset.themeColorHead,
      themeColorSpi: preset.themeColorSpi,
      themeCopy: copyDefaultsFor(next),
    }));
  }

  function copyDefaultsFor(t: ThemeTemplate): TemplateCopy {
    // Clone defaults into the editable JSONB shape.
    return Object.fromEntries(
      (Object.keys(TEMPLATE_COPY_DEFAULTS[t]) as StepKey[]).map((step) => [step, { ...TEMPLATE_COPY_DEFAULTS[t][step] }]),
    ) as TemplateCopy;
  }

  function updateStepCopy(step: StepKey, field: 'title' | 'subtitle', value: string) {
    setTheme((prev) => ({
      ...prev,
      themeCopy: {
        ...(prev.themeCopy ?? {}),
        [step]: { ...(prev.themeCopy?.[step] ?? {}), [field]: value },
      },
    }));
  }

  function currentPreset() {
    const key = (theme.themeTemplate || 'minimal') as ThemeTemplate;
    return TEMPLATE_PRESETS[key];
  }

  function resetMainColors() {
    const p = currentPreset();
    setTheme((prev) => ({
      ...prev,
      themeAccent: p.themeAccent,
      themeAccentDim: p.themeAccentDim,
      themeNavy: p.themeNavy,
      themeText: p.themeText,
    }));
  }

  function resetGroupColors() {
    const p = currentPreset();
    setTheme((prev) => ({
      ...prev,
      themeColorMain: p.themeColorMain,
      themeColorHead: p.themeColorHead,
      themeColorSpi: p.themeColorSpi,
    }));
  }

  function resetFonts() {
    const p = currentPreset();
    setTheme((prev) => ({
      ...prev,
      themeFontDisplay: p.themeFontDisplay,
      themeFontBody: p.themeFontBody,
    }));
  }

  function resetCopy() {
    setTheme((prev) => ({
      ...prev,
      themeCtaLabel: DEFAULTS.themeCtaLabel,
      themeContactTitle: DEFAULTS.themeContactTitle,
      themeContactSubtitle: DEFAULTS.themeContactSubtitle,
      themeCopy: copyDefaultsFor((prev.themeTemplate || 'minimal') as ThemeTemplate),
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

  const template = theme.themeTemplate || DEFAULTS.themeTemplate!;
  const fieldLabels = TEMPLATE_FIELD_LABELS[template];
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
      themeTemplate: template,
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
      themeCopy: theme.themeCopy ?? {},
      logoUrl: null,
      locale: 'es',
      currency: 'EUR',
    }),
    [
      template,
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
      theme.themeCopy,
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

        {/* Template selector */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Plantilla</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Elige la base visual. Los colores, textos y logo de abajo se aplican encima.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => {
              const isActive = template === t.key;
              const isLocked = !t.available;
              return (
                <button
                  key={t.key}
                  type="button"
                  data-testid={`theme-template-${t.key}`}
                  disabled={isLocked}
                  onClick={() => !isLocked && applyTemplatePreset(t.key)}
                  aria-pressed={isActive}
                  className={`relative text-left rounded-xl border p-3 transition-all ${
                    isActive
                      ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.03]'
                      : isLocked
                      ? 'border-gray-150 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <TemplateThumbnail template={t.key} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900 truncate">{t.label}</span>
                        {isLocked && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-600 bg-amber-50 ring-1 ring-amber-100 px-1.5 py-0.5 rounded">
                            Próx.
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{t.mood}</p>
                    </div>
                    {isActive && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main colors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Colores principales</h3>
              <p className="text-xs text-gray-500 mt-0.5">Los labels cambian según la plantilla activa.</p>
            </div>
            <button onClick={resetMainColors} className="text-xs text-gray-500 hover:text-gray-600 transition-colors">
              Resetear
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fieldLabels.mainColors.map((f) => (
              <div
                key={f.key}
                data-testid={f.key === 'themeAccent' ? 'theme-accent-picker' : undefined}
              >
                <ColorField
                  label={f.label}
                  hint={f.hint}
                  value={(theme[f.key] as string | null) || DEFAULTS[f.key] || '#000000'}
                  onChange={(v) => updateField(f.key, v)}
                  testid={f.key === 'themeAccent' ? 'theme-accent-hex' : undefined}
                />
              </div>
            ))}
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
            {fieldLabels.groupColors.map((f) => (
              <ColorField
                key={f.key}
                label={f.label}
                hint={f.hint}
                value={(theme[f.key] as string | null) || DEFAULTS[f.key] || '#000000'}
                onChange={(v) => updateField(f.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Fuentes</h3>
            <button onClick={resetFonts} className="text-xs text-gray-500 hover:text-gray-600 transition-colors">
              Resetear
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fieldLabels.fonts.map((f) => {
              const options = f.key === 'themeFontDisplay' ? FONT_OPTIONS : BODY_FONT_OPTIONS;
              return (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                  {f.hint && <p className="text-[11px] text-gray-400 mb-1.5 leading-tight">{f.hint}</p>}
                  <select
                    value={(theme[f.key] as string | null) || DEFAULTS[f.key] || ''}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                  >
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
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

        {/* Textos de los pasos */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Textos de los pasos</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Titulo y subtitulo de cada paso del configurador. Cambian segun la plantilla elegida.
              </p>
            </div>
            <button
              onClick={() => setTheme((prev) => ({ ...prev, themeCopy: copyDefaultsFor(template) }))}
              className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
            >
              Resetear
            </button>
          </div>
          <div className="space-y-5">
            {STEP_KEYS.map((step) => {
              const defaults = TEMPLATE_COPY_DEFAULTS[template][step.key];
              const current = theme.themeCopy?.[step.key] ?? {};
              return (
                <div key={step.key} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/40">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{step.label}</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Título</label>
                    <input
                      type="text"
                      data-testid={`theme-copy-${step.key}-title`}
                      value={current.title ?? ''}
                      onChange={(e) => updateStepCopy(step.key, 'title', e.target.value)}
                      maxLength={200}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                      placeholder={defaults.title}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Subtítulo</label>
                    <textarea
                      data-testid={`theme-copy-${step.key}-subtitle`}
                      value={current.subtitle ?? ''}
                      onChange={(e) => updateStepCopy(step.key, 'subtitle', e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="w-full border rounded-xl px-3 py-2 text-sm bg-white resize-none"
                      placeholder={defaults.subtitle}
                    />
                  </div>
                </div>
              );
            })}
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
              { n: 1 as const, label: 'Barco' },
              { n: 2 as const, label: 'Vela' },
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

function TemplateThumbnail({ template }: { template: ThemeTemplate }) {
  const STYLES: Record<ThemeTemplate, { bg: string; bar: string; block: string }> = {
    minimal: { bg: '#ffffff', bar: '#111827', block: '#f3f4f6' },
    editorial: { bg: '#f5f1e8', bar: '#0d1f2d', block: '#e6dfce' },
    premium: { bg: '#0a1e3d', bar: '#d4b168', block: '#1a3360' },
    marine: { bg: '#e8f1fb', bar: '#0b5faa', block: '#ffffff' },
  };
  const s = STYLES[template];
  return (
    <div
      className="shrink-0 w-12 h-12 rounded-lg flex flex-col gap-1 p-1.5 ring-1 ring-black/5"
      style={{ background: s.bg }}
      aria-hidden
    >
      <div className="h-1 rounded-full" style={{ background: s.bar, width: '80%' }} />
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="h-1 rounded-full" style={{ background: s.block }} />
        <div className="h-1 rounded-full w-3/4" style={{ background: s.block }} />
      </div>
      <div className="h-1.5 rounded" style={{ background: s.bar, width: '50%' }} />
    </div>
  );
}

function ColorField({ label, hint, value, onChange, testid }: { label: string; hint?: string; value: string; onChange: (v: string) => void; testid?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1.5 leading-tight">{hint}</p>}
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded-lg border cursor-pointer" />
        <input type="text" data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs font-mono" placeholder="#000000" />
      </div>
    </div>
  );
}
