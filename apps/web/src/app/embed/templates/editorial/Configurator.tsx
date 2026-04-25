'use client';

import Image from 'next/image';
import { SAIL_TYPE_LABELS } from '@/lib/constants';
import { SailPreview } from '../../sail-preview';
import { useConfiguratorState } from '../../shared/state';
import { SAIL_GROUPS, STEPS, stepIndex } from '../../shared/constants';
import { resolveCopy } from '../copy';
import type { TemplateConfiguratorProps } from '../types';

/**
 * Editorial náutico template.
 * Visual language: cream paper, serif display, hairlines, italic helpers,
 * uppercase label-mono kickers, dense editorial typographic rhythm.
 */

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

const PAPER = '#f5f1e8';

export function EditorialConfigurator({ apiKey, tenant, previewMode }: TemplateConfiguratorProps) {
  const s = useConfiguratorState({ apiKey, tenant, previewMode });
  const accent = s.accent;
  const accentDim = s.accentDim;
  const currentIdx = stepIndex(s.step);

  // Tenant-driven colors. Editorial identity (cream paper, typography) stays fixed.
  const INK = s.navy;
  const INK_2 = s.textColor;
  const INK_3 = `color-mix(in oklab, ${INK_2} 55%, transparent)`;
  const RULE = `color-mix(in oklab, ${INK} 18%, transparent)`;
  const RULE_SOFT = `color-mix(in oklab, ${INK} 10%, transparent)`;

  const serif = `${s.fontDisplay}, Georgia, serif`;
  const sans = `${s.fontBody}, system-ui, sans-serif`;

  return (
    <div
      className="max-w-2xl mx-auto px-5 sm:px-8 py-6 sm:py-10 min-h-[640px] flex flex-col"
      style={{ background: PAPER, color: INK, fontFamily: sans }}
    >
      {/* ── MASTHEAD ── */}
      <div className="flex items-end justify-between pb-5" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className="flex items-center gap-3 min-w-0">
          {s.step !== 'boat' && s.step !== 'done' && (
            <button
              onClick={s.goBack}
              className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-60"
              style={{ border: `1px solid ${RULE}`, color: INK_2 }}
              aria-label="Atrás"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 4L6 8L10 12" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK_3 }}>
              Plan vélico — pliego
            </p>
            <div className="flex items-center gap-3 mt-1">
              {tenant.logoUrl && (
                <Image src={tenant.logoUrl} alt={tenant.name} width={96} height={24} unoptimized className="h-6 w-auto object-contain" />
              )}
              <h1 className="text-2xl leading-none truncate" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {tenant.name}
              </h1>
            </div>
          </div>
        </div>
        {s.step !== 'done' && (
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK_3 }}>
              Paso
            </p>
            <p className="text-2xl leading-none mt-1 tabular-nums" style={{ fontFamily: serif, fontWeight: 500 }}>
              <span style={{ color: accentDim }}>{ROMAN[Math.min(currentIdx, 4)]}</span>
              <span className="text-base opacity-40"> / V</span>
            </p>
          </div>
        )}
      </div>

      {/* ── STEP MAP — numbered chips on sm+, thin progress + caption on mobile ── */}
      {s.step !== 'done' && (
        <>
          {/* Desktop: full editorial labels with numerals */}
          <div className="mt-5 hidden sm:flex items-center gap-3">
            {STEPS.map((step, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <button
                  key={step.key}
                  data-testid={`embed-step-${step.key}`}
                  onClick={() => { if (!s.isPreview && done) s.setStep(step.key); }}
                  disabled={s.isPreview || (!done && !active)}
                  aria-label={step.label}
                  className="flex items-center gap-2 shrink-0 text-[11px] uppercase font-semibold transition-opacity hover:opacity-70 disabled:cursor-default"
                  style={{ letterSpacing: '0.16em', color: active ? INK : done ? INK_2 : INK_3, opacity: done || active ? 1 : 0.5 }}
                >
                  <span
                    className="w-4 h-4 flex items-center justify-center text-[9px] tabular-nums"
                    style={{
                      border: `1px solid ${active ? accent : RULE}`,
                      background: active ? accent : 'transparent',
                      color: active ? PAPER : INK_2,
                      fontFamily: serif,
                    }}
                  >
                    {done ? '✓' : ROMAN[i]}
                  </span>
                  <span style={{ borderBottom: active ? `1.5px solid ${accent}` : 'none', paddingBottom: 1 }}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile: thin hairline progress + caption (editorial style) */}
          <div className="sm:hidden mt-5">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK }}>
                {STEPS[currentIdx]?.label}
              </span>
              <span className="text-[10px] uppercase font-semibold tabular-nums" style={{ letterSpacing: '0.22em', color: INK_3, fontFamily: serif }}>
                {ROMAN[Math.min(currentIdx, 4)]} · V
              </span>
            </div>
            <div className="h-px" style={{ background: RULE }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%`, background: accent }}
              />
            </div>
          </div>
        </>
      )}

      {/* ── CONTEXT CAPTION ── */}
      {s.step !== 'boat' && s.step !== 'done' && s.selectedBoat && (
        <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.18em', color: INK_3 }}>Barco</span>
            <span className="font-medium">{s.selectedBoat.model}</span>
            {s.selectedBoat.length && <span className="tabular-nums" style={{ color: INK_3 }}>{s.selectedBoat.length} m</span>}
          </div>
          {s.selectedProduct && s.step !== 'products' && (
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.18em', color: INK_3 }}>Vela</span>
              <span style={{ fontFamily: serif, fontWeight: 500 }} className="text-base italic">{s.selectedProduct.name}</span>
              {(() => {
                const area = s.getEffectiveArea(s.selectedProduct);
                return area ? (
                  <span className="tabular-nums" style={{ color: INK_3 }}>{area.toFixed(1)} m²</span>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">

        {/* ═══════════════════════════════════════════════
            I · BOAT
            ═══════════════════════════════════════════════ */}
        {s.step === 'boat' && (() => {
          const copy = resolveCopy(tenant.themeCopy, 'editorial', 'boat');
          return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl leading-tight" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {copy.title}
              </h2>
              <p className="text-sm mt-2 max-w-md italic" style={{ fontFamily: serif, color: INK_2 }}>
                {copy.subtitle}
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: INK_3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                data-testid="embed-boat-search"
                placeholder="Bavaria 38, Beneteau 40…"
                value={s.query}
                onChange={(e) => { s.setQuery(e.target.value); }}
                className="w-full bg-transparent pl-7 pr-4 py-3 text-lg focus:outline-none"
                style={{
                  borderBottom: `1px solid ${RULE}`,
                  fontFamily: serif,
                  fontWeight: 400,
                }}
              />
              {s.searchLoading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-spin" style={{ border: `1.5px solid ${RULE}`, borderTopColor: INK }} />
              )}
            </div>

            {s.boatResults.length > 0 && (
              <ul className="divide-y" style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, borderColor: RULE_SOFT }}>
                {s.boatResults.map((boat, i) => (
                  <li key={boat.id}>
                    <button
                      data-testid={`embed-boat-result-${i}`}
                      onClick={() => s.selectBoat(boat)}
                      className="w-full text-left py-3 grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 transition-colors hover:bg-black/[0.02]"
                    >
                      <span className="text-[10px] tabular-nums font-semibold opacity-50 w-6" style={{ fontFamily: serif }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontFamily: serif, fontWeight: 500 }} className="text-lg truncate">
                        {boat.model}
                      </span>
                      {boat.length ? (
                        <span className="text-xs tabular-nums uppercase font-semibold" style={{ letterSpacing: '0.12em', color: INK_3 }}>
                          {boat.length} m
                        </span>
                      ) : <span />}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={INK_3} strokeWidth="1.5" strokeLinecap="round">
                        <path d="M6 4L10 8L6 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!s.query && !s.selectedBoat && (
              <div className="mt-10 text-center" style={{ borderTop: `1px solid ${RULE_SOFT}`, paddingTop: 40 }}>
                <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.24em', color: INK_3 }}>
                  Catálogo
                </p>
                <p className="mt-3 text-3xl tabular-nums" style={{ fontFamily: serif, fontWeight: 500 }}>
                  4.842
                </p>
                <p className="text-sm italic mt-1" style={{ fontFamily: serif, color: INK_2 }}>
                  modelos con medidas y superficies ya calculadas
                </p>
              </div>
            )}
          </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            II · PRODUCTS
            ═══════════════════════════════════════════════ */}
        {s.step === 'products' && (() => {
          const copy = resolveCopy(tenant.themeCopy, 'editorial', 'products');
          return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl leading-tight" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {copy.title}
              </h2>
              <p className="text-sm mt-2 italic max-w-md" style={{ fontFamily: serif, color: INK_2 }}>
                {copy.subtitle}
              </p>
            </div>

            {/* Expert mode */}
            <div className="flex items-center justify-between gap-4 py-3" style={{ borderTop: `1px solid ${RULE_SOFT}`, borderBottom: `1px solid ${RULE_SOFT}` }}>
              <div>
                <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.18em', color: INK_3 }}>
                  Modo experto
                </p>
                <p className="text-xs mt-0.5 italic" style={{ fontFamily: serif, color: INK_2 }}>
                  {s.expertMode ? 'Editando superficies manualmente.' : 'Usando superficie calculada del barco.'}
                </p>
              </div>
              <button
                data-testid="embed-expert-toggle"
                onClick={() => s.setExpertMode((v) => !v)}
                role="switch"
                aria-checked={s.expertMode}
                className="relative inline-flex h-6 w-11 shrink-0 items-center transition-colors"
                style={{ backgroundColor: s.expertMode ? INK : '#d1cdbf' }}
              >
                <span
                  className="inline-block h-4 w-4"
                  style={{ background: PAPER, transform: s.expertMode ? 'translateX(24px)' : 'translateX(4px)' }}
                />
              </button>
            </div>

            {s.productsLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 rounded-full animate-spin mx-auto" style={{ border: `1.5px solid ${RULE}`, borderTopColor: INK }} />
                <p className="text-sm italic mt-4" style={{ fontFamily: serif, color: INK_3 }}>
                  Buscando velas compatibles…
                </p>
              </div>
            ) : (
              Object.entries(SAIL_GROUPS).map(([groupKey, group], groupIdx) => {
                const groupProducts = s.products.filter((p) => group.types.includes(p.sailType));
                if (groupProducts.length === 0) return null;
                const romanGroup = ['I', 'II', 'III'][groupIdx];
                const gc = s.groupColors[groupKey as 'main' | 'head' | 'spi'];
                return (
                  <div key={groupKey}>
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-xl" style={{ fontFamily: serif, fontWeight: 500, color: gc }}>
                        {romanGroup} ·
                      </span>
                      <h3 className="text-xl" style={{ fontFamily: serif, fontWeight: 500 }}>
                        {group.label}
                      </h3>
                      <div className="flex-1 h-px" style={{ background: RULE }} />
                      <span className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.18em', color: INK_3 }}>
                        {groupProducts.length} {groupProducts.length === 1 ? 'opción' : 'opciones'}
                      </span>
                    </div>
                    <ul>
                      {groupProducts.map((product) => {
                        const defaultArea = s.getBoatSailArea(s.selectedBoat, product.sailType);
                        const area = s.getEffectiveArea(product);
                        const isCustom = s.expertMode && !!s.customAreas[product.id] && Number(s.customAreas[product.id]) > 0;
                        const pricePerSqm = area ? s.getPricePerSqm(product, area) : 0;
                        const estimatedPrice = area && pricePerSqm ? area * pricePerSqm : null;
                        return (
                          <li key={product.id} style={{ borderBottom: `1px solid ${RULE_SOFT}` }}>
                            <div
                              data-testid={`embed-product-card-${product.id}`}
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('input, [data-no-select]')) return;
                                s.selectProduct(product);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.selectProduct(product); }
                              }}
                              className="grid grid-cols-[1fr_auto] items-start gap-6 py-4 cursor-pointer transition-colors hover:bg-black/[0.025] focus:outline-none -mx-2 px-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xl truncate" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.01em' }}>
                                  {product.name}
                                </p>
                                <p className="text-xs mt-1" style={{ color: INK_3 }}>
                                  {SAIL_TYPE_LABELS[product.sailType] || product.sailType}
                                </p>
                                {s.expertMode ? (
                                  <div className="mt-2 flex items-center gap-1.5" data-no-select>
                                    <input
                                      type="number"
                                      data-testid={`embed-custom-area-${product.id}`}
                                      step="0.1"
                                      min="0"
                                      placeholder={defaultArea ? defaultArea.toFixed(1) : '0'}
                                      value={s.customAreas[product.id] ?? ''}
                                      onChange={(e) => s.setCustomAreas((prev) => ({ ...prev, [product.id]: e.target.value }))}
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => e.stopPropagation()}
                                      className="w-20 px-2 py-1 text-xs bg-transparent focus:outline-none tabular-nums"
                                      style={{ borderBottom: `1px solid ${RULE}` }}
                                    />
                                    <span className="text-[11px] italic" style={{ fontFamily: serif, color: INK_3 }}>
                                      m²{isCustom ? ' · custom' : defaultArea ? ` · def ${defaultArea.toFixed(1)}` : ''}
                                    </span>
                                  </div>
                                ) : (
                                  area && (
                                    <p className="text-[11px] mt-1 italic" style={{ fontFamily: serif, color: INK_3 }}>
                                      {area.toFixed(1)} m² para tu barco
                                    </p>
                                  )
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.18em', color: INK_3 }}>
                                  desde
                                </p>
                                {estimatedPrice ? (
                                  <p className="text-2xl leading-none mt-1 tabular-nums" style={{ fontFamily: serif, fontWeight: 500 }}>
                                    {estimatedPrice.toFixed(0)}
                                    <span className="text-sm ml-1" style={{ color: INK_3 }}>{product.currency || s.currency}</span>
                                  </p>
                                ) : (
                                  <p className="text-sm italic mt-1" style={{ fontFamily: serif, color: INK_3 }}>A consultar</p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            III · CONFIGURE
            ═══════════════════════════════════════════════ */}
        {s.step === 'configure' && s.selectedProduct && (() => {
          const copy = resolveCopy(tenant.themeCopy, 'editorial', 'configure');
          return (
          <div className="space-y-7">
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK_3 }}>
                {copy.title}
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl leading-tight" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {s.selectedProduct.name}
              </h2>
              {(() => {
                const area = s.getEffectiveArea(s.selectedProduct);
                const isCustom = s.expertMode && !!s.customAreas[s.selectedProduct.id] && Number(s.customAreas[s.selectedProduct.id]) > 0;
                return area ? (
                  <p className="text-sm italic mt-2" style={{ fontFamily: serif, color: INK_2 }}>
                    Superficie {isCustom ? 'personalizada' : 'calculada'} · {area.toFixed(2)} m²
                  </p>
                ) : null;
              })()}
            </div>

            <div className="space-y-5" style={{ borderTop: `1px solid ${RULE}`, paddingTop: 24 }}>
              {s.selectedProduct.configFields
                .slice()
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => {
                  const mods = field.msrpModifiers as Record<string, number> | null;
                  return (
                    <div key={field.id} className="grid grid-cols-[120px_1fr] gap-6 items-baseline">
                      <label className="text-[10px] uppercase font-semibold pt-2" style={{ letterSpacing: '0.18em', color: INK_3 }}>
                        {field.label}
                        {field.required && <span style={{ color: accent }} className="ml-0.5 normal-case">*</span>}
                      </label>
                      {field.fieldType === 'select' && Array.isArray(field.options) ? (
                        <select
                          value={s.config[field.key] || ''}
                          onChange={(e) => s.setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full bg-transparent py-2 text-base focus:outline-none"
                          style={{ borderBottom: `1px solid ${RULE}`, fontFamily: serif, fontWeight: 500 }}
                        >
                          <option value="">Seleccionar…</option>
                          {field.options.map((opt) => {
                            const mod = mods?.[opt];
                            const modLabel = mod && mod > 0 ? ` (+${mod} ${s.currency})` : '';
                            return <option key={opt} value={opt}>{opt}{modLabel}</option>;
                          })}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={s.config[field.key] || ''}
                          onChange={(e) => s.setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full bg-transparent py-2 text-base focus:outline-none"
                          style={{ borderBottom: `1px solid ${RULE}`, fontFamily: serif }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Price breakdown */}
            {s.pricing && (
              <div className="pt-5" style={{ borderTop: `2px solid ${INK}` }}>
                <p className="text-[10px] uppercase font-semibold mb-4" style={{ letterSpacing: '0.22em', color: INK_3 }}>
                  Cálculo
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-baseline justify-between">
                    <dt className="italic" style={{ fontFamily: serif, color: INK_2 }}>
                      {s.getEffectiveArea(s.selectedProduct)?.toFixed(2)} m² × {s.pricing.pricePerSqm.toFixed(2)} {s.currency}/m²
                    </dt>
                    <dd className="tabular-nums">{s.pricing.base.toFixed(0)} {s.currency}</dd>
                  </div>
                  {s.pricing.extras.map((extra, i) => (
                    <div key={i} className="flex items-baseline justify-between">
                      <dt className="italic truncate pr-4" style={{ fontFamily: serif, color: INK_2 }}>{extra.label}</dt>
                      <dd className="tabular-nums shrink-0" style={{ color: INK_2 }}>+{extra.amount.toFixed(0)} {s.currency}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between pt-3" style={{ borderTop: `1px solid ${RULE}` }}>
                    <dt className="text-base" style={{ fontFamily: serif, fontWeight: 500 }}>Total estimado</dt>
                    <dd className="text-3xl tabular-nums" style={{ fontFamily: serif, fontWeight: 500 }}>
                      {s.pricing.total.toFixed(0)} <span className="text-base" style={{ color: INK_3 }}>{s.currency}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <button
              data-testid="embed-continue-configure"
              onClick={() => s.setStep('preview')}
              className="w-full py-4 text-base tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{ background: INK, color: PAPER, fontFamily: sans, fontWeight: 600, letterSpacing: '0.18em' }}
            >
              Continuar →
            </button>
          </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            IV · PREVIEW
            ═══════════════════════════════════════════════ */}
        {s.step === 'preview' && s.selectedProduct && (() => {
          const copy = resolveCopy(tenant.themeCopy, 'editorial', 'preview');
          return (
          <div className="space-y-7">
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK_3 }}>
                {copy.title}
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl leading-tight" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {s.selectedProduct.name}
              </h2>
              <p className="text-sm italic mt-2" style={{ fontFamily: serif, color: INK_2 }}>
                {SAIL_TYPE_LABELS[s.selectedProduct.sailType] || s.selectedProduct.sailType}
                {' · '}
                <span className="tabular-nums">{s.getEffectiveArea(s.selectedProduct)?.toFixed(1)} m²</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8" style={{ borderTop: `1px solid ${RULE}`, paddingTop: 20 }}>
              <div>
                <div className="aspect-[4/5] max-h-[360px] w-full" style={{ background: 'rgba(255,255,255,0.4)' }}>
                  <SailPreview
                    sailType={s.selectedProduct.sailType}
                    variant={s.selectedProduct.variant}
                    accent={accent}
                    reefs={s.config.rizos === '3 rizos' ? 3 : 2}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                {(() => {
                  const selectedOptions = s.selectedProduct!.configFields
                    .map((field) => ({ field, value: s.config[field.key] }))
                    .filter((x) => x.value);
                  if (selectedOptions.length === 0) return null;
                  return (
                    <div data-testid="embed-config-summary" className="mb-6">
                      <p className="text-[10px] uppercase font-semibold mb-2" style={{ letterSpacing: '0.18em', color: INK_3 }}>
                        Tu configuración
                      </p>
                      <dl className="divide-y" style={{ borderColor: RULE_SOFT }}>
                        {selectedOptions.map(({ field, value }) => (
                          <div key={field.key} className="flex items-baseline justify-between py-1.5 gap-4">
                            <dt className="text-xs italic" style={{ fontFamily: serif, color: INK_2 }}>{field.label}</dt>
                            <dd className="text-sm truncate" style={{ fontFamily: serif, fontWeight: 500 }}>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })()}

                {s.selectedProduct.features && s.selectedProduct.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase font-semibold mb-2" style={{ letterSpacing: '0.18em', color: INK_3 }}>
                      Incluido de serie
                    </p>
                    <ul data-testid="embed-features-list" className="space-y-1.5">
                      {s.selectedProduct.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ fontFamily: serif, color: INK_2 }}>
                          <span style={{ color: INK_3 }}>—</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.pricing && (
                  <div className="mt-auto pt-4 text-[11px] space-y-1" style={{ borderTop: `1px solid ${RULE_SOFT}`, color: INK_3 }}>
                    <div className="flex justify-between tabular-nums">
                      <span className="italic" style={{ fontFamily: serif }}>{s.getEffectiveArea(s.selectedProduct)?.toFixed(2)} m² × {s.pricing.pricePerSqm.toFixed(2)}</span>
                      <span>{s.pricing.base.toFixed(0)} {s.currency}</span>
                    </div>
                    {s.pricing.extras.map((extra, i) => (
                      <div key={i} className="flex justify-between tabular-nums gap-3">
                        <span className="italic truncate" style={{ fontFamily: serif }}>{extra.label}</span>
                        <span className="shrink-0">+{extra.amount.toFixed(0)} {s.currency}</span>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between pt-2 mt-2" style={{ borderTop: `1px solid ${RULE}`, color: INK }}>
                      <span className="text-xs uppercase font-semibold" style={{ letterSpacing: '0.18em' }}>Total</span>
                      <span className="text-xl tabular-nums" style={{ fontFamily: serif, fontWeight: 500 }}>
                        {s.pricing.total.toFixed(0)} {s.currency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              data-testid="embed-continue-preview"
              onClick={() => s.setStep('contact')}
              className="w-full py-4 text-base uppercase transition-opacity hover:opacity-90"
              style={{ background: INK, color: PAPER, fontFamily: sans, fontWeight: 600, letterSpacing: '0.18em' }}
            >
              Solicitar presupuesto →
            </button>
          </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            V · CONTACT
            ═══════════════════════════════════════════════ */}
        {s.step === 'contact' && s.selectedProduct && (() => {
          const copy = resolveCopy(tenant.themeCopy, 'editorial', 'contact');
          return (
          <div className="space-y-7">
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK_3 }}>
                Epígrafe final
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl leading-tight" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {copy.title}
              </h2>
              <p className="text-sm italic mt-2" style={{ fontFamily: serif, color: INK_2 }}>
                {copy.subtitle}
              </p>
            </div>

            <div className="space-y-5" style={{ borderTop: `1px solid ${RULE}`, paddingTop: 24 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <EditorialField label="Nombre" required accent={accent} labelColor={INK_3}>
                  <input
                    type="text"
                    value={s.customerName}
                    onChange={(e) => s.setCustomerName(e.target.value)}
                    className="w-full bg-transparent py-2 text-base focus:outline-none"
                    style={{ borderBottom: `1px solid ${RULE}`, fontFamily: serif }}
                    placeholder="Tu nombre"
                  />
                </EditorialField>
                <EditorialField label="Email" required accent={accent} labelColor={INK_3}>
                  <input
                    type="email"
                    value={s.customerEmail}
                    onChange={(e) => s.setCustomerEmail(e.target.value)}
                    className="w-full bg-transparent py-2 text-base focus:outline-none"
                    style={{ borderBottom: `1px solid ${RULE}`, fontFamily: serif }}
                    placeholder="tu@email.com"
                  />
                </EditorialField>
              </div>
              <EditorialField label="Teléfono" accent={accent} labelColor={INK_3}>
                <input
                  type="tel"
                  value={s.customerPhone}
                  onChange={(e) => s.setCustomerPhone(e.target.value)}
                  className="w-full bg-transparent py-2 text-base focus:outline-none tabular-nums"
                  style={{ borderBottom: `1px solid ${RULE}`, fontFamily: serif }}
                  placeholder="+34 611 234 567"
                />
              </EditorialField>
              <EditorialField label="Notas" accent={accent} labelColor={INK_3}>
                <textarea
                  value={s.customerNotes}
                  onChange={(e) => s.setCustomerNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent py-2 text-base focus:outline-none italic resize-none"
                  style={{ borderBottom: `1px solid ${RULE}`, fontFamily: serif, color: INK_2 }}
                  placeholder="Cualquier detalle adicional…"
                />
              </EditorialField>
            </div>

            {s.pricing && (
              <div className="flex items-baseline justify-between pt-5" style={{ borderTop: `2px solid ${INK}` }}>
                <div>
                  <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.22em', color: INK_3 }}>
                    Total estimado
                  </p>
                  <p className="text-xs italic mt-1" style={{ fontFamily: serif, color: INK_2 }}>
                    Este presupuesto se confirmará por correo.
                  </p>
                </div>
                <p className="text-4xl leading-none tabular-nums" style={{ fontFamily: serif, fontWeight: 500 }}>
                  {s.pricing.total.toFixed(0)}
                  <span className="text-base ml-1" style={{ color: INK_3 }}>{s.currency}</span>
                </p>
              </div>
            )}

            <button
              data-testid="embed-submit-quote"
              onClick={s.submitQuote}
              disabled={s.submitting || !s.customerName.trim() || !s.customerEmail.trim()}
              className="w-full py-4 text-base uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: INK, color: PAPER, fontFamily: sans, fontWeight: 600, letterSpacing: '0.18em' }}
            >
              {s.submitting ? 'Enviando…' : (tenant.themeCtaLabel || 'Solicitar presupuesto')}
            </button>

            {s.submitError && (
              <div
                data-testid="embed-submit-error"
                role="alert"
                className="px-4 py-3 text-sm"
                style={{ background: `${accent}14`, borderLeft: `3px solid ${accent}`, color: accent, fontFamily: serif, fontStyle: 'italic' }}
              >
                {s.submitError}
              </div>
            )}
          </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            DONE
            ═══════════════════════════════════════════════ */}
        {s.step === 'done' && (
          <div className="py-12 text-center">
            <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.28em', color: INK_3 }}>
              Enviado
            </p>
            <h2 className="mt-4 text-4xl leading-tight" style={{ fontFamily: serif, fontWeight: 500, letterSpacing: '-0.015em' }}>
              Presupuesto solicitado
            </h2>
            <p className="mt-4 text-base italic max-w-md mx-auto" style={{ fontFamily: serif, color: INK_2 }}>
              Hemos recibido tu solicitud. Te contactaremos a{' '}
              <span className="not-italic font-medium" style={{ color: INK }}>{s.customerEmail}</span>{' '}
              con el presupuesto detallado.
            </p>
            <button
              onClick={s.resetAll}
              className="mt-8 px-6 py-3 text-[10px] uppercase transition-opacity hover:opacity-70"
              style={{ border: `1px solid ${RULE}`, color: INK_2, letterSpacing: '0.22em', fontWeight: 600 }}
            >
              Nuevo presupuesto
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-12 pt-5 flex items-center justify-between" style={{ borderTop: `1px solid ${RULE_SOFT}` }}>
        <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: '0.24em', color: INK_3 }}>
          Aerolume · plan vélico
        </p>
        <p className="text-[10px] tabular-nums" style={{ color: INK_3 }}>
          No. {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function EditorialField({ label, required, accent, labelColor, children }: { label: string; required?: boolean; accent: string; labelColor: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase font-semibold mb-1" style={{ letterSpacing: '0.18em', color: labelColor }}>
        {label}
        {required && <span style={{ color: accent }} className="ml-0.5 normal-case">*</span>}
      </label>
      {children}
    </div>
  );
}
