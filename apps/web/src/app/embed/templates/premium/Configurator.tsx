'use client';

import Image from 'next/image';
import { SAIL_TYPE_LABELS } from '@/lib/constants';
import { SailPreview } from '../../sail-preview';
import { useConfiguratorState } from '../../shared/state';
import { SAIL_GROUPS, STEPS, stepIndex } from '../../shared/constants';
import type { TemplateConfiguratorProps } from '../types';
import { resolveCopy } from '../copy';

/**
 * Premium oscuro template.
 * Visual language: flat navy, gold accents (#d4b168), flat tinted cards,
 * dense layout, uppercase kickers — yacht brokerage feel.
 */

const INK_MUTED_ALPHA = 0.62;
const INK_SOFT_ALPHA = 0.38;
const GLASS = 'rgba(255,255,255,0.05)';
const GLASS_BORDER = 'rgba(255,255,255,0.09)';
const PRODUCT_CARD_BG = 'rgba(255,255,255,0.06)';

export function PremiumConfigurator({ apiKey, tenant, previewMode }: TemplateConfiguratorProps) {
  const s = useConfiguratorState({ apiKey, tenant, previewMode });
  const currentIdx = stepIndex(s.step);

  // Tenant-driven palette. Premium identity (flat cards, noise, dense layout) stays fixed.
  const GOLD = s.accent;
  const INK = s.textColor;
  const GLASS_BORDER_STRONG = `${GOLD}59`;
  // Flat navy background so the shell reflects the tenant color without gradients.
  const BG = s.navy;
  const INK_MUTED = `color-mix(in oklab, ${INK} ${INK_MUTED_ALPHA * 100}%, transparent)`;
  const INK_SOFT = `color-mix(in oklab, ${INK} ${INK_SOFT_ALPHA * 100}%, transparent)`;

  const fontBody = `${s.fontBody}, system-ui, sans-serif`;

  // Shared CTA styling (flat gold, preserved depth shadow).
  const ctaStyle = { background: GOLD, color: '#0a1e3d', boxShadow: `0 8px 28px ${GOLD}33` } as const;
  const ctaStyleStrong = { background: GOLD, color: '#0a1e3d', boxShadow: `0 8px 28px ${GOLD}44` } as const;

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative min-h-[640px]"
      style={{ background: BG, color: INK, fontFamily: fontBody }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      <div className="relative">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {s.step !== 'boat' && s.step !== 'done' && (
              <button
                onClick={s.goBack}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ border: `1px solid ${GLASS_BORDER}`, color: INK_MUTED }}
                aria-label="Atrás"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 4L6 8L10 12" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-3 min-w-0">
              {tenant.logoUrl ? (
                <Image src={tenant.logoUrl} alt={tenant.name} width={108} height={28} unoptimized className="h-7 w-auto object-contain opacity-90" />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${GOLD}1f`, border: `1px solid ${GOLD}55` }}
                >
                  <span className="text-sm font-bold" style={{ color: GOLD, fontFamily: `${s.fontDisplay}, serif` }}>
                    {tenant.name[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold tracking-[0.22em]" style={{ color: GOLD }}>
                  Configurador privado
                </p>
                <h1 className="text-lg font-semibold truncate mt-0.5" style={{ color: INK, letterSpacing: '-0.01em' }}>
                  {tenant.name}
                </h1>
              </div>
            </div>
          </div>
          {s.step !== 'done' && (
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase font-semibold tracking-[0.22em]" style={{ color: INK_SOFT }}>
                Paso
              </p>
              <p className="text-lg font-semibold tabular-nums mt-0.5" style={{ color: INK }}>
                {currentIdx + 1}
                <span className="text-sm" style={{ color: INK_SOFT }}> / {STEPS.length}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── PROGRESS BAR ── */}
        {s.step !== 'done' && (
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {STEPS.map((step, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <button
                  key={step.key}
                  data-testid={`embed-step-${step.key}`}
                  onClick={() => { if (!s.isPreview && done) s.setStep(step.key); }}
                  disabled={s.isPreview || (!done && !active)}
                  className="flex-1 min-w-[32px] h-1 rounded-full transition-all disabled:cursor-default hover:opacity-80"
                  style={{
                    background: active || done ? GOLD : 'rgba(255,255,255,0.10)',
                    boxShadow: active ? `0 0 12px ${GOLD}55` : 'none',
                  }}
                  aria-label={step.label}
                />
              );
            })}
          </div>
        )}

        {/* ── CONTEXT CAPSULE ── */}
        {s.step !== 'boat' && s.step !== 'done' && s.selectedBoat && (
          <div
            className="mt-5 rounded-2xl px-4 py-3 flex items-center gap-4 flex-wrap"
            style={{ background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${GLASS_BORDER}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: GOLD }}>LOA</span>
              <span className="text-sm font-semibold">{s.selectedBoat.model}</span>
              {s.selectedBoat.length && (
                <span className="text-xs tabular-nums" style={{ color: INK_MUTED }}>{s.selectedBoat.length} m</span>
              )}
            </div>
            {s.selectedProduct && s.step !== 'products' && (
              <>
                <span style={{ color: INK_SOFT }}>·</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: GOLD }}>Vela</span>
                  <span className="text-sm font-semibold truncate">{s.selectedProduct.name}</span>
                  {(() => {
                    const area = s.getEffectiveArea(s.selectedProduct);
                    return area ? <span className="text-xs tabular-nums" style={{ color: INK_MUTED }}>{area.toFixed(1)} m²</span> : null;
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-7">

          {/* ═══════════════════════════════════════════════
              I · BOAT
              ═══════════════════════════════════════════════ */}
          {s.step === 'boat' && (() => {
            const boatCopy = resolveCopy(tenant.themeCopy, 'premium', 'boat');
            return (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>Paso I</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: INK, letterSpacing: '-0.015em' }}>
                  {boatCopy.title}
                </h2>
                <p className="text-sm mt-2 max-w-md" style={{ color: INK_MUTED }}>
                  {boatCopy.subtitle}
                </p>
              </div>

              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${GLASS_BORDER}` }}
              >
                <div className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: GOLD }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  data-testid="embed-boat-search"
                  placeholder="Busca un modelo (Bavaria 38, Hanse 455…)"
                  value={s.query}
                  onChange={(e) => { s.setQuery(e.target.value); }}
                  className="w-full bg-transparent pl-12 pr-5 py-4 text-base focus:outline-none"
                  style={{ color: INK }}
                />
                {s.searchLoading && (
                  <div
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-spin"
                    style={{ border: '2px solid rgba(255,255,255,0.15)', borderTopColor: GOLD }}
                  />
                )}
              </div>

              {s.boatResults.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden divide-y max-h-96 overflow-y-auto"
                  style={{ background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${GLASS_BORDER}`, borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  {s.boatResults.map((boat, i) => (
                    <button
                      key={boat.id}
                      data-testid={`embed-boat-result-${i}`}
                      onClick={() => s.selectBoat(boat)}
                      className="w-full text-left px-5 py-4 flex items-center gap-4 transition-colors hover:bg-white/5"
                    >
                      <span className="text-[10px] tabular-nums font-bold" style={{ color: GOLD }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-sm font-semibold truncate">{boat.model}</span>
                      {boat.length && (
                        <span
                          className="text-[11px] tabular-nums uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                          style={{ background: `${GOLD}20`, color: GOLD, border: `1px solid ${GOLD}40` }}
                        >
                          {boat.length} m
                        </span>
                      )}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round">
                        <path d="M6 4L10 8L6 12" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {!s.query && !s.selectedBoat && (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                >
                  <p className="text-[10px] uppercase font-bold tracking-[0.28em]" style={{ color: GOLD }}>Catálogo</p>
                  <p className="mt-3 text-4xl font-semibold tabular-nums" style={{ color: INK }}>4.842</p>
                  <p className="text-sm mt-1" style={{ color: INK_MUTED }}>
                    embarcaciones con medidas y superficies documentadas
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
            const productsCopy = resolveCopy(tenant.themeCopy, 'premium', 'products');
            return (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>Paso II</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: INK, letterSpacing: '-0.015em' }}>
                  {productsCopy.title}
                </h2>
                <p className="text-sm mt-2 max-w-md" style={{ color: INK_MUTED }}>
                  {productsCopy.subtitle}
                </p>
              </div>

              {/* Expert mode */}
              <div
                className="rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
                style={{
                  background: s.expertMode ? `${GOLD}14` : GLASS,
                  border: `1px solid ${s.expertMode ? GLASS_BORDER_STRONG : GLASS_BORDER}`,
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.expertMode ? GOLD : INK_MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
                    </svg>
                    <p className="text-sm font-semibold">Modo experto</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: INK_MUTED }}>
                    {s.expertMode ? 'Superficies editables' : 'Superficies calculadas del barco'}
                  </p>
                </div>
                <button
                  data-testid="embed-expert-toggle"
                  onClick={() => s.setExpertMode((v) => !v)}
                  role="switch"
                  aria-checked={s.expertMode}
                  className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                  style={{ background: s.expertMode ? GOLD : 'rgba(255,255,255,0.14)' }}
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full transition-transform"
                    style={{ background: '#0a1e3d', transform: s.expertMode ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </button>
              </div>

              {s.productsLoading ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 rounded-full animate-spin mx-auto" style={{ border: '2px solid rgba(255,255,255,0.15)', borderTopColor: GOLD }} />
                  <p className="text-sm mt-4" style={{ color: INK_MUTED }}>Buscando colección compatible…</p>
                </div>
              ) : (
                Object.entries(SAIL_GROUPS).map(([groupKey, group]) => {
                  const groupProducts = s.products.filter((p) => group.types.includes(p.sailType));
                  if (groupProducts.length === 0) return null;
                  const gc = s.groupColors[groupKey as 'main' | 'head' | 'spi'];
                  return (
                    <div key={groupKey}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${gc}33`, border: `1px solid ${gc}66` }}
                        >
                          <span className="text-[11px] font-bold" style={{ color: gc }}>
                            {groupKey[0].toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: gc }}>
                          {group.label}
                        </h3>
                        <div className="flex-1 h-px" style={{ background: `${gc}40` }} />
                      </div>
                      <div className="space-y-2.5">
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
                              className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer transition-all hover:scale-[1.01] focus:outline-none focus:ring-2 group"
                              style={{
                                background: PRODUCT_CARD_BG,
                                border: `1px solid ${GLASS_BORDER}`,
                                ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}50`,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = GLASS_BORDER_STRONG)}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = GLASS_BORDER)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{product.name}</p>
                                <p className="text-[11px] mt-0.5" style={{ color: INK_MUTED }}>
                                  {SAIL_TYPE_LABELS[product.sailType] || product.sailType}
                                </p>
                                {s.expertMode ? (
                                  <div className="mt-1.5 flex items-center gap-1.5" data-no-select>
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
                                      className="w-20 px-2 py-1 text-xs rounded bg-black/30 focus:outline-none tabular-nums"
                                      style={{ border: `1px solid ${GLASS_BORDER}`, color: INK }}
                                    />
                                    <span className="text-[10px] uppercase tracking-wider" style={{ color: INK_MUTED }}>
                                      m²{isCustom ? ' · custom' : defaultArea ? ` · def ${defaultArea.toFixed(1)}` : ''}
                                    </span>
                                  </div>
                                ) : (
                                  area && (
                                    <p className="text-[11px] mt-1 tabular-nums uppercase tracking-wider" style={{ color: INK_MUTED }}>
                                      Sup. {area.toFixed(1)} m²
                                    </p>
                                  )
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] uppercase font-bold tracking-[0.18em]" style={{ color: GOLD }}>
                                  desde
                                </p>
                                {estimatedPrice ? (
                                  <p className="text-xl font-semibold tabular-nums" style={{ color: INK }}>
                                    {estimatedPrice.toFixed(0)}
                                    <span className="text-xs ml-1" style={{ color: INK_MUTED }}>{product.currency || s.currency}</span>
                                  </p>
                                ) : (
                                  <p className="text-xs mt-1" style={{ color: INK_MUTED }}>A consultar</p>
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
            );
          })()}

          {/* ═══════════════════════════════════════════════
              III · CONFIGURE
              ═══════════════════════════════════════════════ */}
          {s.step === 'configure' && s.selectedProduct && (() => {
            const configureCopy = resolveCopy(tenant.themeCopy, 'premium', 'configure');
            return (
            <div className="space-y-6">
              <div
                className="rounded-2xl p-6"
                style={{ background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${GLASS_BORDER}` }}
              >
                <div className="mb-6">
                  <p className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>
                    {configureCopy.title}
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-semibold" style={{ color: INK, letterSpacing: '-0.01em' }}>
                    {s.selectedProduct.name}
                  </h2>
                  <p className="text-xs mt-1" style={{ color: INK_MUTED }}>
                    {configureCopy.subtitle}
                  </p>
                  {(() => {
                    const area = s.getEffectiveArea(s.selectedProduct);
                    const isCustom = s.expertMode && !!s.customAreas[s.selectedProduct!.id] && Number(s.customAreas[s.selectedProduct!.id]) > 0;
                    return area ? (
                      <p className="text-xs mt-1" style={{ color: INK_MUTED }}>
                        Superficie {isCustom ? 'personalizada' : 'calculada'} · <span className="tabular-nums">{area.toFixed(2)} m²</span>
                      </p>
                    ) : null;
                  })()}
                </div>

                <div className="space-y-4">
                  {s.selectedProduct.configFields
                    .slice()
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((field) => {
                      const mods = field.msrpModifiers as Record<string, number> | null;
                      return (
                        <div key={field.id}>
                          <label className="block text-[10px] uppercase font-bold tracking-[0.2em] mb-1.5" style={{ color: GOLD }}>
                            {field.label}
                            {field.required && <span style={{ color: '#e87a6d' }} className="ml-0.5 normal-case">*</span>}
                          </label>
                          {field.fieldType === 'select' && Array.isArray(field.options) ? (
                            <select
                              value={s.config[field.key] || ''}
                              onChange={(e) => s.setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                              style={{
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${GLASS_BORDER}`,
                                color: INK,
                                ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}60`,
                              }}
                            >
                              <option value="" style={{ background: '#0a1e3d' }}>Seleccionar…</option>
                              {field.options.map((opt) => {
                                const mod = mods?.[opt];
                                const modLabel = mod && mod > 0 ? ` (+${mod} ${s.currency})` : '';
                                return (
                                  <option key={opt} value={opt} style={{ background: '#0a1e3d' }}>
                                    {opt}{modLabel}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={s.config[field.key] || ''}
                              onChange={(e) => s.setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                              style={{
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${GLASS_BORDER}`,
                                color: INK,
                                ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}60`,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Price */}
              {s.pricing && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: `${GOLD}14`,
                    border: `1px solid ${GLASS_BORDER_STRONG}`,
                  }}
                >
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between" style={{ color: INK_MUTED }}>
                      <dt className="truncate pr-3">
                        {s.getEffectiveArea(s.selectedProduct)?.toFixed(2)} m² × {s.pricing.pricePerSqm.toFixed(2)} {s.currency}/m²
                      </dt>
                      <dd className="tabular-nums shrink-0">{s.pricing.base.toFixed(0)} {s.currency}</dd>
                    </div>
                    {s.pricing.extras.map((extra, i) => (
                      <div key={i} className="flex justify-between" style={{ color: INK_MUTED }}>
                        <dt className="truncate pr-3">{extra.label}</dt>
                        <dd className="tabular-nums shrink-0">+{extra.amount.toFixed(0)} {s.currency}</dd>
                      </div>
                    ))}
                    <div
                      className="flex items-baseline justify-between pt-3 mt-3"
                      style={{ borderTop: `1px solid ${GOLD}40` }}
                    >
                      <dt className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>
                        Total estimado
                      </dt>
                      <dd className="text-3xl font-semibold tabular-nums" style={{ color: INK }}>
                        {s.pricing.total.toFixed(0)}
                        <span className="text-base ml-1" style={{ color: INK_MUTED }}>{s.currency}</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              <button
                data-testid="embed-continue-configure"
                onClick={() => s.setStep('preview')}
                className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:scale-[1.02]"
                style={ctaStyle}
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
            const previewCopy = resolveCopy(tenant.themeCopy, 'premium', 'preview');
            return (
            <div className="space-y-5">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${GLASS_BORDER}` }}
              >
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>
                      {previewCopy.title}
                    </p>
                    <h3 className="text-lg font-semibold truncate mt-0.5" style={{ color: INK }}>{s.selectedProduct.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: INK_MUTED }}>
                      {SAIL_TYPE_LABELS[s.selectedProduct.sailType] || s.selectedProduct.sailType}
                      <span className="mx-1.5" style={{ color: INK_SOFT }}>·</span>
                      <span className="tabular-nums">{s.getEffectiveArea(s.selectedProduct)?.toFixed(1)} m²</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: INK_MUTED }}>
                      {previewCopy.subtitle}
                    </p>
                  </div>
                  {s.pricing && (
                    <div className="text-right shrink-0">
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em]" style={{ color: GOLD }}>Total</p>
                      <p className="text-xl font-semibold tabular-nums" style={{ color: INK }}>
                        {s.pricing.total.toFixed(0)}
                        <span className="text-xs ml-1" style={{ color: INK_MUTED }}>{s.currency}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 p-4">
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GLASS_BORDER}` }}
                  >
                    <div className="aspect-[4/5] max-h-[360px] w-full">
                      <SailPreview
                        sailType={s.selectedProduct.sailType}
                        variant={s.selectedProduct.variant}
                        accent={GOLD}
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
                        <div data-testid="embed-config-summary" className="mb-5">
                          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2" style={{ color: GOLD }}>
                            Tu configuración
                          </p>
                          <ul className="space-y-1.5">
                            {selectedOptions.map(({ field, value }) => (
                              <li key={field.key} className="flex items-baseline justify-between gap-3 text-sm">
                                <span style={{ color: INK_MUTED }}>{field.label}</span>
                                <span className="font-semibold truncate" style={{ color: INK }}>{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}

                    {s.selectedProduct.features && s.selectedProduct.features.length > 0 && (
                      <div className="mb-5">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2" style={{ color: GOLD }}>
                          Incluido de serie
                        </p>
                        <ul data-testid="embed-features-list" className="space-y-1.5">
                          {s.selectedProduct.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: INK_MUTED }}>
                              <svg width="14" height="14" className="mt-0.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 10l4 4 8-8" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {s.pricing && (
                      <div className="mt-auto pt-4 space-y-1 text-xs" style={{ borderTop: `1px solid ${GLASS_BORDER}`, color: INK_MUTED }}>
                        <div className="flex justify-between tabular-nums">
                          <span>{s.getEffectiveArea(s.selectedProduct)?.toFixed(2)} m² × {s.pricing.pricePerSqm.toFixed(2)}</span>
                          <span>{s.pricing.base.toFixed(0)} {s.currency}</span>
                        </div>
                        {s.pricing.extras.map((extra, i) => (
                          <div key={i} className="flex justify-between tabular-nums gap-3">
                            <span className="truncate">{extra.label}</span>
                            <span className="shrink-0">+{extra.amount.toFixed(0)} {s.currency}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                data-testid="embed-continue-preview"
                onClick={() => s.setStep('contact')}
                className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:scale-[1.02]"
                style={ctaStyle}
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
            const { title: contactTitle, subtitle: contactSubtitle } = resolveCopy(tenant.themeCopy, 'premium', 'contact');
            return (
            <div className="space-y-5">
              <div
                className="rounded-2xl p-6"
                style={{ background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${GLASS_BORDER}` }}
              >
                <div className="mb-5">
                  <p className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>Paso final</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-semibold" style={{ color: INK, letterSpacing: '-0.01em' }}>
                    {contactTitle}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: INK_MUTED }}>
                    {contactSubtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PremiumField label="Nombre" required accent={GOLD}>
                      <input type="text" value={s.customerName} onChange={(e) => s.setCustomerName(e.target.value)}
                        className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                        style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GLASS_BORDER}`, color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}60` }}
                        placeholder="Tu nombre" />
                    </PremiumField>
                    <PremiumField label="Email" required accent={GOLD}>
                      <input type="email" value={s.customerEmail} onChange={(e) => s.setCustomerEmail(e.target.value)}
                        className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                        style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GLASS_BORDER}`, color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}60` }}
                        placeholder="tu@email.com" />
                    </PremiumField>
                  </div>
                  <PremiumField label="Teléfono" accent={GOLD}>
                    <input type="tel" value={s.customerPhone} onChange={(e) => s.setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 tabular-nums"
                      style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GLASS_BORDER}`, color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}60` }}
                      placeholder="+34 611 234 567" />
                  </PremiumField>
                  <PremiumField label="Notas" accent={GOLD}>
                    <textarea value={s.customerNotes} onChange={(e) => s.setCustomerNotes(e.target.value)} rows={3}
                      className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GLASS_BORDER}`, color: INK, ['--tw-ring-color' as keyof React.CSSProperties]: `${GOLD}60` }}
                      placeholder="Cualquier detalle adicional…" />
                  </PremiumField>
                </div>
              </div>

              {s.pricing && (
                <div
                  className="rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{
                    background: `${GOLD}14`,
                    border: `1px solid ${GLASS_BORDER_STRONG}`,
                  }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-[0.22em]" style={{ color: GOLD }}>
                    Total estimado
                  </span>
                  <span className="text-2xl font-semibold tabular-nums" style={{ color: INK }}>
                    {s.pricing.total.toFixed(0)}
                    <span className="text-sm ml-1" style={{ color: INK_MUTED }}>{s.currency}</span>
                  </span>
                </div>
              )}

              <button
                data-testid="embed-submit-quote"
                onClick={s.submitQuote}
                disabled={s.submitting || !s.customerName.trim() || !s.customerEmail.trim()}
                className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                style={ctaStyleStrong}
              >
                {s.submitting ? 'Enviando…' : (tenant.themeCtaLabel || 'Solicitar presupuesto')}
              </button>

              {s.submitError && (
                <div
                  data-testid="embed-submit-error"
                  role="alert"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(232, 122, 109, 0.12)', border: '1px solid rgba(232, 122, 109, 0.35)', color: '#f5b3ac' }}
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
            <div className="text-center py-16">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: `${GOLD}1f`,
                  border: `1px solid ${GLASS_BORDER_STRONG}`,
                  boxShadow: `0 0 40px ${GOLD}25`,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-[0.28em]" style={{ color: GOLD }}>Confirmado</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold" style={{ color: INK, letterSpacing: '-0.015em' }}>
                Presupuesto solicitado
              </h2>
              <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: INK_MUTED }}>
                Hemos recibido tu solicitud. Te contactaremos a{' '}
                <span className="font-semibold" style={{ color: INK }}>{s.customerEmail}</span>.
              </p>
              <button
                onClick={s.resetAll}
                className="mt-7 px-6 py-2.5 rounded-full text-xs uppercase font-bold tracking-[0.2em] transition-colors hover:bg-white/5"
                style={{ border: `1px solid ${GLASS_BORDER}`, color: INK_MUTED }}
              >
                Nuevo presupuesto
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-10 pt-5 flex items-center justify-between" style={{ borderTop: `1px solid ${GLASS_BORDER}` }}>
          <p className="text-[10px] uppercase font-bold tracking-[0.24em]" style={{ color: INK_SOFT }}>
            Aerolume · premium
          </p>
          <span className="tabular-nums text-[10px]" style={{ color: INK_SOFT }}>{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}

function PremiumField({ label, required, accent, children }: { label: string; required?: boolean; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase font-bold tracking-[0.2em] mb-1.5" style={{ color: accent }}>
        {label}
        {required && <span style={{ color: '#e87a6d' }} className="ml-0.5 normal-case">*</span>}
      </label>
      {children}
    </div>
  );
}
