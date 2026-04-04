'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Loader2,
    Minus, Package, Plus, Ruler, Settings2, ShoppingCart, Tag,
} from 'lucide-react';
import { PRODUCT_CONFIGS } from '@/data/product-config';

type ProductDetail = {
    name: string;
    price: string | null;
    priceTaxExc: string | null;
    currency: string;
    sku: string | null;
    shortDescription: string;
    fullDescription: string;
    images: string[];
    breadcrumbs: { name: string; url: string }[];
    weight: string | null;
    availability: string | null;
    configuration: { label: string; options: string[] }[];
    url: string;
};

function formatPriceDisplay(value: number, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

function ProductPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read product info from query params
    const productUrl = searchParams.get('url');
    const productName = searchParams.get('name') ?? '';
    const productPrice = searchParams.get('price') ? Number(searchParams.get('price')) : null;
    const productImage = searchParams.get('image');
    const productGamme = searchParams.get('gamme');
    const productId = searchParams.get('pid') ?? '';
    const productHighlights: string[] = (() => {
        try { return JSON.parse(searchParams.get('highlights') ?? '[]'); } catch { return []; }
    })();
    const productAttributes: string[] = (() => {
        try { return JSON.parse(searchParams.get('attributes') ?? '[]'); } catch { return []; }
    })();

    // Static configuration for this product type
    const staticConfig = PRODUCT_CONFIGS[productId] ?? null;

    const [detail, setDetail] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [configSelections, setConfigSelections] = useState<Record<string, string>>({});

    const fetchDetail = useCallback(async () => {
        if (!productUrl) { setLoading(false); return; }
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/sail-product-detail?url=${encodeURIComponent(productUrl)}`);
            if (res.ok) setDetail(await res.json());
            else setError(true);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [productUrl]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // Init dropdown selections from static config
    useEffect(() => {
        const fields = staticConfig?.fields;
        if (!fields) return;
        const initial: Record<string, string> = {};
        for (const field of fields) {
            if (field.options.length > 0) initial[field.key] = field.options[0];
        }
        setConfigSelections(initial);
    }, [staticConfig]);

    // Keyboard nav for images
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') setActiveImage((c) => (c - 1 + images.length) % images.length);
            if (e.key === 'ArrowRight') setActiveImage((c) => (c + 1) % images.length);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    });

    const images = detail?.images?.length ? detail.images : productImage ? [productImage] : [];
    const displayName = detail?.name || productName;

    // Price calculations
    const unitPrice = detail?.price ? Number(detail.price) : productPrice;
    const unitPriceTaxExc = detail?.priceTaxExc ? Number(detail.priceTaxExc) : null;
    const totalPrice = unitPrice !== null && unitPrice !== undefined && !Number.isNaN(unitPrice) ? unitPrice * quantity : null;
    const totalPriceTaxExc = unitPriceTaxExc !== null && !Number.isNaN(unitPriceTaxExc) ? unitPriceTaxExc * quantity : null;

    const hasConfiguration = staticConfig && staticConfig.fields.length > 0;

    return (
        <section className="relative min-h-screen bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(11,95,170,0.04),transparent_60%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-8 lg:pt-32">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al configurador
                </motion.button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
                        <p className="mt-4 text-sm text-[var(--color-text-muted)]">Cargando ficha del producto...</p>
                    </div>
                ) : (
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
                        {/* ── Left: Image gallery ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:sticky lg:top-28"
                        >
                            {images.length > 0 ? (
                                <>
                                    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                                        <div className="relative aspect-[4/3]">
                                            <img
                                                src={images[activeImage] ?? images[0]}
                                                alt={displayName}
                                                className="h-full w-full object-contain p-8"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    if (target.src.includes('large_default')) {
                                                        target.src = target.src.replace('-large_default/', '-home_default/');
                                                    }
                                                }}
                                            />
                                        </div>

                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveImage((c) => (c - 1 + images.length) % images.length)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 border border-[var(--color-border)] shadow-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveImage((c) => (c + 1) % images.length)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 border border-[var(--color-border)] shadow-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {images.length > 1 && (
                                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setActiveImage(i)}
                                                    className={`shrink-0 h-20 w-20 rounded-xl border-2 overflow-hidden transition-all ${
                                                        i === activeImage
                                                            ? 'border-[var(--color-accent)] shadow-md'
                                                            : 'border-[var(--color-border)] opacity-60 hover:opacity-100'
                                                    }`}
                                                >
                                                    <img
                                                        src={img.replace('-large_default/', '-small_default/')}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center aspect-[4/3] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                                    <Package className="h-20 w-20 text-[var(--color-text-muted)]/20" />
                                </div>
                            )}
                        </motion.div>

                        {/* ── Right: Product info ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Breadcrumbs */}
                            {detail?.breadcrumbs && detail.breadcrumbs.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                    {detail.breadcrumbs.map((bc, i) => (
                                        <span key={i} className="flex items-center gap-1.5">
                                            {i > 0 && <span className="text-[var(--color-border-strong)]">/</span>}
                                            <span>{bc.name}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Category */}
                            <div className="mt-2 text-xs uppercase tracking-wider text-[var(--color-accent)]">
                                {productGamme ?? 'Vela a medida'}
                            </div>

                            {/* Name */}
                            <h1 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] font-light leading-[0.95] text-[var(--color-text)]">
                                {displayName}
                            </h1>

                            {/* Price block */}
                            <div className="mt-6 rounded-xl border border-[var(--color-accent)]/15 bg-[var(--color-accent-light)] p-5">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                            {quantity > 1 ? `Precio total (${quantity} uds.)` : 'Precio unitario'}
                                        </div>
                                        <div className="mt-1 font-[var(--font-display)] text-4xl text-[var(--color-accent)]">
                                            {totalPrice !== null ? formatPriceDisplay(totalPrice) : 'Consultar'}
                                        </div>
                                    </div>
                                    {quantity > 1 && unitPrice !== null && (
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Precio unitario</div>
                                            <div className="mt-0.5 text-sm font-medium text-[var(--color-text-secondary)]">
                                                {formatPriceDisplay(unitPrice)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {totalPriceTaxExc !== null && (
                                    <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                                        {formatPriceDisplay(totalPriceTaxExc)} sin IVA
                                    </div>
                                )}
                                <div className="mt-1 text-xs text-[var(--color-text-muted)]">Impuestos incluidos</div>
                            </div>

                            {/* Availability */}
                            {detail?.availability && (
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {detail.availability === 'InStock' ? 'En stock' :
                                     detail.availability === 'PreOrder' ? 'Bajo pedido' :
                                     detail.availability}
                                </div>
                            )}

                            <div className="mt-6 border-t border-[var(--color-border)]" />

                            {/* Short description */}
                            {(detail?.shortDescription || productHighlights.length > 0) && (
                                <div className="mt-6">
                                    {detail?.shortDescription && (
                                        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                                            {detail.shortDescription}
                                        </p>
                                    )}
                                    {productHighlights.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {productHighlights.map((h) => (
                                                <div key={h} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                                                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                                                    <span>{h}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Configuration dropdowns */}
                            {hasConfiguration && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-accent)]">
                                        <Settings2 className="h-4 w-4" />
                                        Configuracion
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        {staticConfig!.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-xs font-medium text-[var(--color-text)] mb-2">
                                                    {field.label}
                                                </label>
                                                {field.options.length === 1 ? (
                                                    <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text)]">
                                                        {field.options[0]}
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={configSelections[field.key] ?? field.options[0] ?? ''}
                                                        onChange={(e) => setConfigSelections((c) => ({ ...c, [field.key]: e.target.value }))}
                                                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]/40 focus:ring-2 focus:ring-[var(--color-accent)]/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238899aa%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_14px_center]"
                                                    >
                                                        {field.options.map((opt, i) => (
                                                            <option key={i} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attributes */}
                            {productAttributes.length > 0 && (
                                <div className="mt-6">
                                    <div className="text-xs font-medium text-[var(--color-text)] mb-3">Atributos de esta configuracion</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {productAttributes.map((a) => {
                                            const [key, ...rest] = a.split(':');
                                            const val = rest.join(':').trim();
                                            return (
                                                <div key={a} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                                                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] capitalize">{key?.trim()}</div>
                                                    <div className="mt-1 text-sm font-medium text-[var(--color-text)]">{val || key}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 border-t border-[var(--color-border)]" />

                            {/* Quantity + Action */}
                            <div className="mt-6">
                                <label className="block text-xs font-medium text-[var(--color-text)] mb-3">
                                    Cantidad
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-white">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="flex h-12 w-12 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] border-r border-[var(--color-border)]"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            step={1}
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = Math.floor(Number(e.target.value));
                                                setQuantity(Math.max(1, Number.isNaN(val) ? 1 : val));
                                            }}
                                            className="w-16 h-12 text-center text-base font-medium text-[var(--color-text)] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => q + 1)}
                                            className="flex h-12 w-12 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] border-l border-[var(--color-border)]"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <a
                                        href={productUrl ?? '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[var(--color-accent)] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-accent-dim)] hover:shadow-[0_8px_30px_rgba(11,95,170,0.25)]"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Solicitar presupuesto
                                    </a>
                                </div>
                            </div>

                            {/* Technical details */}
                            {(detail?.sku || detail?.weight) && (
                                <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                    <div className="text-xs font-medium text-[var(--color-text)] mb-3">Datos tecnicos</div>
                                    <div className="space-y-3">
                                        {detail.sku && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Tag className="h-4 w-4 text-[var(--color-text-muted)]" />
                                                <span className="text-[var(--color-text-muted)]">Referencia:</span>
                                                <span className="font-medium text-[var(--color-text)]">{detail.sku}</span>
                                            </div>
                                        )}
                                        {detail.weight && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Ruler className="h-4 w-4 text-[var(--color-text-muted)]" />
                                                <span className="text-[var(--color-text-muted)]">Peso:</span>
                                                <span className="font-medium text-[var(--color-text)]">{detail.weight}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Full description */}
                            {detail?.fullDescription && (
                                <div className="mt-8">
                                    <div className="text-xs font-medium text-[var(--color-text)] mb-3">Descripcion completa</div>
                                    <div className="text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-line rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                        {detail.fullDescription}
                                    </div>
                                </div>
                            )}

                            {/* Error fallback */}
                            {error && (
                                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                    No se pudo cargar la ficha completa del fabricante. Se muestran los datos disponibles.
                                </div>
                            )}

                            {/* External link */}
                            {productUrl && (
                                <a
                                    href={productUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver en web del fabricante
                                </a>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function ProductPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            </div>
        }>
            <ProductPageContent />
        </Suspense>
    );
}
