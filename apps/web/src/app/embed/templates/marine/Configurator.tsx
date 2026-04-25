'use client';

import Image from 'next/image';
import { SAIL_TYPE_LABELS } from '@/lib/constants';
import { SailPreview } from '../../sail-preview';
import { useConfiguratorState } from '../../shared/state';
import { SAIL_GROUPS, STEPS, stepIndex } from '../../shared/constants';
import type { TemplateConfiguratorProps } from '../types';
import { resolveCopy } from '../copy';

/**
 * Marine bold template.
 * Visual language: bright primary blocks, wave accents, chunky rounded UI,
 * large CTAs, playful illustrated-leaning — friendly consumer-first.
 */

export function MarineConfigurator({ apiKey, tenant, previewMode }: TemplateConfiguratorProps) {
  const s = useConfiguratorState({ apiKey, tenant, previewMode });
  const currentIdx = stepIndex(s.step);

  // Tenant-driven palette.
  const INK = s.textColor;
  const INK_MUTED = `color-mix(in oklab, ${INK} 62%, transparent)`;
  const INK_SOFT = `color-mix(in oklab, ${INK} 38%, transparent)`;
  const PRIMARY = s.accent;
  const SEA = s.navy;

  const sans = `${s.fontBody}, system-ui, sans-serif`;
  const display = `${s.fontDisplay}, ${s.fontBody}, system-ui, sans-serif`;

  // Group colors come from tenant (themeColorMain/Head/Spi).
  const GROUP_COLOR: Record<string, string> = {
    main: s.groupColors.main,
    head: s.groupColors.head,
    spi: s.groupColors.spi,
  };

  // Editable step copy (tenant overrides on top of Marine defaults).
  const boatCopy = resolveCopy(tenant.themeCopy, 'marine', 'boat');
  const productsCopy = resolveCopy(tenant.themeCopy, 'marine', 'products');
  const configureCopy = resolveCopy(tenant.themeCopy, 'marine', 'configure');
  const previewCopy = resolveCopy(tenant.themeCopy, 'marine', 'preview');
  const contactCopy = resolveCopy(tenant.themeCopy, 'marine', 'contact');

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-5 py-4 sm:py-6 min-h-[640px]"
      style={{ background: '#ffffff', color: INK, fontFamily: sans }}
    >
      {/* ── HEADER CARD (wave) ── */}
      {s.step !== 'done' && (
        <div
          className="relative rounded-3xl p-5 overflow-hidden"
          style={{ background: SEA, color: '#fff' }}
        >
          {/* Wave bottom */}
          <svg
            className="absolute -bottom-1 left-0 right-0 w-full pointer-events-none"
            height="22"
            viewBox="0 0 400 22"
            preserveAspectRatio="none"
            fill="#ffffff"
          >
            <path d="M0 10 Q 50 0 100 10 T 200 10 T 300 10 T 400 10 V 22 H 0 Z" />
          </svg>

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {s.step !== 'boat' && (
                <button
                  onClick={s.goBack}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors border-2 border-white/20 shrink-0"
                  aria-label="Atrás"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M10 4L6 8L10 12" />
                  </svg>
                </button>
              )}
              <div className="min-w-0">
                {tenant.logoUrl ? (
                  <Image src={tenant.logoUrl} alt={tenant.name} width={96} height={24} unoptimized className="h-6 w-auto object-contain mb-1" />
                ) : (
                  <p className="text-[10px] uppercase font-black tracking-wider opacity-80">{tenant.name}</p>
                )}
                <h1 className="text-2xl font-black tracking-tight mt-0.5 truncate" style={{ fontFamily: display }}>
                  ¡Configura tus velas!
                </h1>
                <p className="text-xs opacity-85 mt-0.5">Presupuesto en 2 minutos · sin compromiso</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress chunky */}
      {s.step !== 'done' && (
        <div className="flex flex-wrap gap-2 mt-5 mb-6">
          {STEPS.map((step, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <button
                key={step.key}
                data-testid={`embed-step-${step.key}`}
                onClick={() => { if (!s.isPreview && done) s.setStep(step.key); }}
                disabled={s.isPreview || (!done && !active)}
                className="flex-1 min-w-[60px] flex flex-col items-start gap-1 text-left group disabled:cursor-default"
              >
                <div
                  className="h-2 rounded-full w-full transition-all"
                  style={{
                    background: done ? SEA : active ? PRIMARY : '#e3edf7',
                    boxShadow: active ? `0 2px 8px ${PRIMARY}55` : 'none',
                  }}
                />
                <span
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate max-w-full"
                  style={{ color: done || active ? INK : INK_SOFT }}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Context pills */}
      {s.step !== 'boat' && s.step !== 'done' && s.selectedBoat && (
        <div className="flex flex-wrap gap-2 mb-5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: `${SEA}15`, color: SEA, border: `2px solid ${SEA}30` }}
          >
            ⚓ {s.selectedBoat.model}
            {s.selectedBoat.length && <span style={{ opacity: 0.6 }}>· {s.selectedBoat.length}m</span>}
          </div>
          {s.selectedProduct && s.step !== 'products' && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black"
              style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `2px solid ${PRIMARY}30` }}
            >
              🛟 {s.selectedProduct.name}
              {(() => {
                const area = s.getEffectiveArea(s.selectedProduct);
                return area ? <span style={{ opacity: 0.6 }}>· {area.toFixed(1)} m²</span> : null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          I · BOAT
          ═══════════════════════════════════════════════ */}
      {s.step === 'boat' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: display }}>{boatCopy.title}</h2>
            <p className="text-sm mt-2" style={{ color: INK_MUTED }}>
              {boatCopy.subtitle}
            </p>
          </div>

          <div
            className="relative rounded-2xl bg-white"
            style={{ border: '3px solid #e3edf7' }}
          >
            <div className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: INK_SOFT }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              data-testid="embed-boat-search"
              placeholder="Prueba con 'Bavaria' o 'Beneteau'…"
              value={s.query}
              onChange={(e) => { s.setQuery(e.target.value); }}
              className="w-full bg-transparent pl-14 pr-5 py-4 text-base font-bold focus:outline-none"
              style={{ color: INK }}
            />
            {s.searchLoading && (
              <div
                className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full animate-spin"
                style={{ border: '2px solid #e3edf7', borderTopColor: PRIMARY }}
              />
            )}
          </div>

          {s.boatResults.length > 0 && (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {s.boatResults.map((boat, i) => (
                <li key={boat.id}>
                  <button
                    data-testid={`embed-boat-result-${i}`}
                    onClick={() => s.selectBoat(boat)}
                    className="w-full text-left rounded-2xl bg-white px-5 py-4 flex items-center gap-4 transition-colors group"
                    style={{ border: '3px solid #e3edf7' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = PRIMARY)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e3edf7')}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black"
                      style={{ background: `${SEA}15`, color: SEA }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black truncate">{boat.model}</p>
                    </div>
                    {boat.length && (
                      <span
                        className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: `${SEA}15`, color: SEA }}
                      >
                        {boat.length} m
                      </span>
                    )}
                    <svg className="shrink-0" width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={PRIMARY} strokeWidth="2.2" strokeLinecap="round">
                      <path d="M6 4L10 8L6 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!s.query && !s.selectedBoat && (
            <div
              className="rounded-3xl p-8 text-center"
              style={{ background: `${SEA}08`, border: `2px dashed ${SEA}30` }}
            >
              <p className="text-5xl font-black tabular-nums" style={{ color: SEA }}>4.842</p>
              <p className="text-sm font-bold mt-2" style={{ color: INK_MUTED }}>
                modelos en el catálogo · seguro que tenemos el tuyo
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          II · PRODUCTS
          ═══════════════════════════════════════════════ */}
      {s.step === 'products' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: display }}>{productsCopy.title}</h2>
            <p className="text-sm mt-2" style={{ color: INK_MUTED }}>
              {productsCopy.subtitle}
            </p>
          </div>

          {/* Expert toggle */}
          <div
            className="rounded-2xl p-4 bg-white flex items-center justify-between gap-4"
            style={{ border: s.expertMode ? `3px solid ${PRIMARY}` : '3px solid #e3edf7' }}
          >
            <div className="min-w-0">
              <p className="text-sm font-black flex items-center gap-2">
                <span style={{ color: s.expertMode ? PRIMARY : INK_SOFT }}>⚙</span>
                Modo experto
              </p>
              <p className="text-xs mt-0.5" style={{ color: INK_MUTED }}>
                {s.expertMode ? 'Puedes editar superficies.' : 'Usamos las superficies del barco.'}
              </p>
            </div>
            <button
              data-testid="embed-expert-toggle"
              onClick={() => s.setExpertMode((v) => !v)}
              role="switch"
              aria-checked={s.expertMode}
              className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
              style={{ background: s.expertMode ? PRIMARY : '#d1dae5' }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: s.expertMode ? 'translateX(26px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          {s.productsLoading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mx-auto" style={{ border: '3px solid #e3edf7', borderTopColor: PRIMARY }} />
              <p className="text-sm font-bold mt-4" style={{ color: INK_MUTED }}>Cargando velas…</p>
            </div>
          ) : (
            Object.entries(SAIL_GROUPS).map(([groupKey, group]) => {
              const groupProducts = s.products.filter((p) => group.types.includes(p.sailType));
              if (groupProducts.length === 0) return null;
              const gc = GROUP_COLOR[groupKey] || SEA;
              return (
                <div key={groupKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-black"
                      style={{ background: gc, boxShadow: `0 4px 12px ${gc}44` }}
                    >
                      {group.label[0]}
                    </span>
                    <h3 className="text-lg font-black tracking-tight">{group.label}</h3>
                    <span className="text-xs font-black" style={{ color: INK_SOFT }}>· {groupProducts.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupProducts.map((product) => {
                      const defaultArea = s.getBoatSailArea(s.selectedBoat, product.sailType);
                      const area = s.getEffectiveArea(product);
                      const isCustom = s.expertMode && !!s.customAreas[product.id] && Number(s.customAreas[product.id]) > 0;
                      const pricePerSqm = area ? s.getPricePerSqm(product, area) : 0;
                      const estimatedPrice = area && pricePerSqm ? area * pricePerSqm : null;
                      return (
                        <div
                          key={product.id}
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
                          className="relative rounded-2xl p-4 bg-white transition-colors cursor-pointer focus:outline-none"
                          style={{ border: `3px solid ${gc}20` }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = gc)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${gc}20`)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black leading-tight truncate">{product.name}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: INK_MUTED }}>
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
                                    className="w-20 px-2 py-1 text-xs rounded-lg focus:outline-none tabular-nums font-bold"
                                    style={{ border: '2px solid #e3edf7', color: INK }}
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: INK_MUTED }}>
                                    m²{isCustom ? ' · custom' : ''}
                                  </span>
                                </div>
                              ) : (
                                area && (
                                  <p className="text-[11px] font-black mt-1 tabular-nums" style={{ color: INK_MUTED }}>
                                    {area.toFixed(1)} m²
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                          <div
                            className="mt-3 pt-3 flex items-baseline justify-between"
                            style={{ borderTop: `2px dashed ${gc}20` }}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: INK_SOFT }}>desde</span>
                            {estimatedPrice ? (
                              <span className="text-lg font-black tabular-nums" style={{ color: gc }}>
                                {estimatedPrice.toFixed(0)}
                                <span className="text-xs ml-0.5" style={{ color: INK_SOFT }}>{product.currency || s.currency}</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold" style={{ color: INK_MUTED }}>A consultar</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          III · CONFIGURE
          ═══════════════════════════════════════════════ */}
      {s.step === 'configure' && s.selectedProduct && (
        <div className="space-y-5">
          <div
            className="rounded-3xl overflow-hidden bg-white"
            style={{ border: '3px solid #e3edf7' }}
          >
            <div
              className="px-5 py-4"
              style={{ background: `${SEA}0d` }}
            >
              <h2 className="text-xl font-black tracking-tight">{s.selectedProduct.name}</h2>
              <p className="text-xs font-bold mt-1" style={{ color: INK_MUTED }}>
                {configureCopy.subtitle}
              </p>
            </div>

            <div className="p-5 space-y-4">
              {s.selectedProduct.configFields
                .slice()
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => {
                  const mods = field.msrpModifiers as Record<string, number> | null;
                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: INK }}>
                        {field.label}
                        {field.required && <span style={{ color: PRIMARY }} className="ml-0.5 normal-case">*</span>}
                      </label>
                      {field.fieldType === 'select' && Array.isArray(field.options) ? (
                        <select
                          value={s.config[field.key] || ''}
                          onChange={(e) => s.setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-white focus:outline-none focus:ring-2"
                          style={{ border: '2px solid #e3edf7', color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: PRIMARY }}
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
                          className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-white focus:outline-none focus:ring-2"
                          style={{ border: '2px solid #e3edf7', color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: PRIMARY }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>

            {s.pricing && (
              <div
                className="mx-5 mb-5 rounded-2xl p-4"
                style={{ background: SEA, color: '#fff' }}
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-80 truncate pr-3">
                      {s.getEffectiveArea(s.selectedProduct)?.toFixed(2)} m² × {s.pricing.pricePerSqm.toFixed(2)}
                    </span>
                    <span className="font-bold tabular-nums shrink-0">{s.pricing.base.toFixed(0)} {s.currency}</span>
                  </div>
                  {s.pricing.extras.map((extra, i) => (
                    <div key={i} className="flex justify-between opacity-80">
                      <span className="truncate pr-3">{extra.label}</span>
                      <span className="tabular-nums shrink-0">+{extra.amount.toFixed(0)} {s.currency}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-white/25">
                  <span className="text-xs font-black uppercase tracking-wider opacity-90">Total</span>
                  <span className="text-2xl font-black tabular-nums">
                    {s.pricing.total.toFixed(0)} <span className="text-sm opacity-75">{s.currency}</span>
                  </span>
                </div>
              </div>
            )}

            <div className="px-5 pb-5">
              <button
                data-testid="embed-continue-configure"
                onClick={() => s.setStep('preview')}
                className="w-full py-4 rounded-full text-sm font-black text-white uppercase tracking-wider transition-colors hover:opacity-90"
                style={{ background: PRIMARY }}
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          IV · PREVIEW
          ═══════════════════════════════════════════════ */}
      {s.step === 'preview' && s.selectedProduct && (
        <div className="space-y-5">
          <div
            className="rounded-3xl overflow-hidden bg-white"
            style={{ border: '3px solid #e3edf7' }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between gap-4"
              style={{ background: `${SEA}0d`, borderBottom: '2px solid #f4f8fc' }}
            >
              <div className="min-w-0">
                <h3 className="text-lg font-black truncate">{s.selectedProduct.name}</h3>
                <p className="text-xs font-bold mt-0.5" style={{ color: INK_MUTED }}>
                  {previewCopy.subtitle}
                </p>
              </div>
              {s.pricing && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: INK_SOFT }}>Total</p>
                  <p className="text-xl font-black tabular-nums" style={{ color: PRIMARY }}>
                    {s.pricing.total.toFixed(0)}
                    <span className="text-xs ml-1" style={{ color: INK_SOFT }}>{s.currency}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 p-4">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#f2f9ff', border: '2px solid #e3edf7' }}>
                <div className="aspect-[4/5] max-h-[360px] w-full">
                  <SailPreview
                    sailType={s.selectedProduct.sailType}
                    variant={s.selectedProduct.variant}
                    accent={PRIMARY}
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
                    <div data-testid="embed-config-summary" className="mb-4 rounded-2xl p-3" style={{ background: `${PRIMARY}10`, border: `2px solid ${PRIMARY}25` }}>
                      <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>
                        Tu configuración
                      </p>
                      <ul className="space-y-1">
                        {selectedOptions.map(({ field, value }) => (
                          <li key={field.key} className="flex items-baseline justify-between gap-3 text-sm">
                            <span style={{ color: INK_MUTED }}>{field.label}</span>
                            <span className="font-black truncate" style={{ color: INK }}>{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {s.selectedProduct.features && s.selectedProduct.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: SEA }}>
                      Incluido de serie
                    </p>
                    <ul data-testid="embed-features-list" className="space-y-1.5">
                      {s.selectedProduct.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-bold" style={{ color: INK }}>
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full mt-0.5 shrink-0" style={{ background: SEA }}>
                            <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 10l4 4 8-8" />
                            </svg>
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.pricing && (
                  <div className="mt-auto pt-3 space-y-1 text-xs" style={{ borderTop: '2px dashed #e3edf7', color: INK_MUTED }}>
                    <div className="flex justify-between tabular-nums font-bold">
                      <span>{s.getEffectiveArea(s.selectedProduct)?.toFixed(2)} m² × {s.pricing.pricePerSqm.toFixed(2)}</span>
                      <span>{s.pricing.base.toFixed(0)} {s.currency}</span>
                    </div>
                    {s.pricing.extras.map((extra, i) => (
                      <div key={i} className="flex justify-between tabular-nums font-bold gap-3">
                        <span className="truncate">{extra.label}</span>
                        <span className="shrink-0">+{extra.amount.toFixed(0)} {s.currency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 pt-1">
              <button
                data-testid="embed-continue-preview"
                onClick={() => s.setStep('contact')}
                className="w-full py-4 rounded-full text-sm font-black text-white uppercase tracking-wider transition-colors hover:opacity-90"
                style={{ background: PRIMARY }}
              >
                Solicitar presupuesto →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          V · CONTACT
          ═══════════════════════════════════════════════ */}
      {s.step === 'contact' && s.selectedProduct && (
        <div className="space-y-5">
          <div
            className="rounded-3xl overflow-hidden bg-white"
            style={{ border: '3px solid #e3edf7' }}
          >
            <div className="px-5 py-4" style={{ background: `${PRIMARY}0d` }}>
              <h2 className="text-xl font-black tracking-tight">
                {contactCopy.title}
              </h2>
              <p className="text-xs font-bold mt-1" style={{ color: INK_MUTED }}>
                {contactCopy.subtitle}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MarineField label="Nombre" required ink={INK} accent={PRIMARY}>
                  <input type="text" value={s.customerName} onChange={(e) => s.setCustomerName(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-white focus:outline-none focus:ring-2"
                    style={{ border: '2px solid #e3edf7', color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: PRIMARY }}
                    placeholder="Tu nombre" />
                </MarineField>
                <MarineField label="Email" required ink={INK} accent={PRIMARY}>
                  <input type="email" value={s.customerEmail} onChange={(e) => s.setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-white focus:outline-none focus:ring-2"
                    style={{ border: '2px solid #e3edf7', color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: PRIMARY }}
                    placeholder="tu@email.com" />
                </MarineField>
              </div>
              <MarineField label="Teléfono" ink={INK} accent={PRIMARY}>
                <input type="tel" value={s.customerPhone} onChange={(e) => s.setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-white focus:outline-none focus:ring-2 tabular-nums"
                  style={{ border: '2px solid #e3edf7', color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: PRIMARY }}
                  placeholder="+34 611 234 567" />
              </MarineField>
              <MarineField label="Notas" ink={INK} accent={PRIMARY}>
                <textarea value={s.customerNotes} onChange={(e) => s.setCustomerNotes(e.target.value)} rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-white focus:outline-none focus:ring-2 resize-none"
                  style={{ border: '2px solid #e3edf7', color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: PRIMARY }}
                  placeholder="Cualquier detalle adicional…" />
              </MarineField>
            </div>

            {s.pricing && (
              <div className="mx-5 mb-4 rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: SEA, color: '#fff' }}>
                <span className="text-xs font-black uppercase tracking-wider opacity-90">Total estimado</span>
                <span className="text-xl font-black tabular-nums">
                  {s.pricing.total.toFixed(0)} <span className="text-sm opacity-75">{s.currency}</span>
                </span>
              </div>
            )}

            <div className="px-5 pb-5 space-y-3">
              <button
                data-testid="embed-submit-quote"
                onClick={s.submitQuote}
                disabled={s.submitting || !s.customerName.trim() || !s.customerEmail.trim()}
                className="w-full py-4 rounded-full text-sm font-black text-white uppercase tracking-wider transition-colors hover:opacity-90 disabled:opacity-40"
                style={{ background: PRIMARY }}
              >
                {s.submitting ? 'Enviando…' : (tenant.themeCtaLabel || 'Solicitar presupuesto')}
              </button>
              {s.submitError && (
                <div
                  data-testid="embed-submit-error"
                  role="alert"
                  className="rounded-2xl px-4 py-3 text-sm font-bold"
                  style={{ background: '#fef2f2', border: '2px solid #fecaca', color: '#991b1b' }}
                >
                  {s.submitError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          DONE
          ═══════════════════════════════════════════════ */}
      {s.step === 'done' && (
        <div className="text-center py-12">
          <div
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: PRIMARY, boxShadow: `0 12px 32px ${PRIMARY}44` }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: display }}>¡Enviado! 🎉</h2>
          <p className="mt-3 text-sm font-bold max-w-md mx-auto" style={{ color: INK_MUTED }}>
            Te contactaremos a <span style={{ color: INK }}>{s.customerEmail}</span> con el presupuesto detallado.
          </p>
          <button
            onClick={s.resetAll}
            className="mt-7 px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider transition-colors hover:bg-gray-50"
            style={{ background: '#fff', border: '3px solid #e3edf7', color: INK }}
          >
            Nuevo presupuesto
          </button>
        </div>
      )}
    </div>
  );
}

function MarineField({ label, required, ink, accent, children }: { label: string; required?: boolean; ink: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: ink }}>
        {label}
        {required && <span style={{ color: accent }} className="ml-0.5 normal-case">*</span>}
      </label>
      {children}
    </div>
  );
}
