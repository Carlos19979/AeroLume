'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronLeft, ChevronRight, ExternalLink, Package, Tag, Ruler, Settings2, Minus, Plus, ShoppingCart } from 'lucide-react';

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

type Props = {
    productUrl: string | null;
    productName: string;
    productPrice: number | null;
    productImage: string | null;
    productHighlights: string[];
    productAttributes: string[];
    productGamme: string | null;
    onClose: () => void;
};

function formatPriceDisplay(value: string | null, currency: string) {
    if (!value) return null;
    const num = Number(value.replace(',', '.'));
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 }).format(num);
}

export function ProductDetailModal({
    productUrl,
    productName,
    productPrice,
    productImage,
    productHighlights,
    productAttributes,
    productGamme,
    onClose,
}: Props) {
    const [detail, setDetail] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [configSelections, setConfigSelections] = useState<Record<string, string>>({});

    const fetchDetail = useCallback(async () => {
        if (!productUrl) return;
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/sail-product-detail?url=${encodeURIComponent(productUrl)}`);
            if (res.ok) {
                setDetail(await res.json());
            } else {
                setError(true);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [productUrl]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // Initialize dropdown selections to first option when detail loads
    useEffect(() => {
        if (!detail?.configuration) return;
        const initial: Record<string, string> = {};
        for (const config of detail.configuration) {
            if (config.options.length > 0) {
                initial[config.label] = config.options[0];
            }
        }
        setConfigSelections(initial);
    }, [detail]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Use scraped images, fall back to API image
    const images = detail?.images?.length ? detail.images : productImage ? [productImage] : [];
    const displayName = detail?.name || productName;
    const displayPrice = detail?.price
        ? formatPriceDisplay(detail.price, detail.currency)
        : productPrice !== null
            ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(productPrice)
            : 'Consultar';

    const hasConfiguration = detail?.configuration && detail.configuration.length > 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-2 md:p-4"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-6xl my-4 rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_30px_100px_rgba(10,37,64,0.2)] overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] shadow-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
                            <p className="mt-4 text-sm text-[var(--color-text-muted)]">Cargando ficha del producto...</p>
                        </div>
                    ) : (
                        <div className="md:grid md:grid-cols-[1fr_1.2fr] max-h-[92vh]">
                            {/* Image gallery — sticky so it stays while scrolling */}
                            <div className="relative bg-[var(--color-surface)] md:sticky md:top-0 md:self-start md:max-h-[92vh] md:overflow-y-auto">
                                {images.length > 0 ? (
                                    <>
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <Image
                                                src={images[activeImage] ?? images[0]}
                                                alt={displayName}
                                                width={600}
                                                height={450}
                                                unoptimized
                                                className="h-full w-full object-contain p-6"
                                            />
                                        </div>

                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveImage((c) => (c - 1 + images.length) % images.length)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-[var(--color-border)] shadow-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveImage((c) => (c + 1) % images.length)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-[var(--color-border)] shadow-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>

                                                <div className="flex gap-2 p-3 overflow-x-auto">
                                                    {images.map((img, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => setActiveImage(i)}
                                                            className={`shrink-0 h-16 w-16 rounded-lg border-2 overflow-hidden transition-all ${
                                                                i === activeImage
                                                                    ? 'border-[var(--color-accent)] shadow-sm'
                                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <Image
                                                                src={img.replace('-large_default/', '-small_default/')}
                                                                alt=""
                                                                width={64}
                                                                height={64}
                                                                unoptimized
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center aspect-square">
                                        <Package className="h-16 w-16 text-[var(--color-text-muted)]" />
                                    </div>
                                )}
                            </div>

                            {/* Product info — scrollable independently */}
                            <div className="p-6 md:p-8 overflow-y-auto max-h-[92vh]">
                                {/* Breadcrumbs */}
                                {detail?.breadcrumbs && detail.breadcrumbs.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                        {detail.breadcrumbs.map((bc, i) => (
                                            <span key={i} className="flex items-center gap-1.5">
                                                {i > 0 && <span>/</span>}
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
                                <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--color-text)] leading-tight">
                                    {displayName}
                                </h2>

                                {/* Price */}
                                <div className="mt-4 flex items-baseline gap-3">
                                    <span className="font-[var(--font-display)] text-3xl text-[var(--color-accent)]">
                                        {displayPrice}
                                    </span>
                                    {detail?.priceTaxExc && (
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            ({formatPriceDisplay(detail.priceTaxExc, detail.currency)} sin IVA)
                                        </span>
                                    )}
                                </div>

                                {/* Availability */}
                                {detail?.availability && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        {detail.availability === 'InStock' ? 'En stock' :
                                         detail.availability === 'PreOrder' ? 'Bajo pedido' :
                                         detail.availability}
                                    </div>
                                )}

                                <div className="mt-5 border-t border-[var(--color-border)]" />

                                {/* Short description / highlights */}
                                {(detail?.shortDescription || productHighlights.length > 0) && (
                                    <div className="mt-5">
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
                                    <div className="mt-5">
                                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
                                            <Settings2 className="h-3.5 w-3.5" />
                                            Configuracion
                                        </div>
                                        <div className="mt-3 space-y-3">
                                            {detail!.configuration.map((config) => (
                                                <div key={config.label}>
                                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">
                                                        {config.label}
                                                    </label>
                                                    <select
                                                        value={configSelections[config.label] ?? config.options[0] ?? ''}
                                                        onChange={(e) => setConfigSelections((c) => ({ ...c, [config.label]: e.target.value }))}
                                                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]/40 focus:ring-2 focus:ring-[var(--color-accent)]/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238899aa%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]"
                                                    >
                                                        {config.options.map((opt, i) => (
                                                            <option key={i} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attributes from API */}
                                {productAttributes.length > 0 && (
                                    <div className="mt-5">
                                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Atributos de esta configuracion</div>
                                        <div className="mt-2 space-y-1.5">
                                            {productAttributes.map((a) => {
                                                const [key, ...rest] = a.split(':');
                                                const val = rest.join(':').trim();
                                                return (
                                                    <div key={a} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
                                                        <span className="text-[var(--color-text-muted)] capitalize">{key?.trim()}</span>
                                                        <span className="font-medium text-[var(--color-text)]">{val || key}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5 border-t border-[var(--color-border)]" />

                                {/* Quantity + Add to cart */}
                                <div className="mt-5">
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-2">
                                        Cantidad
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-white">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                className="flex h-11 w-11 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] border-r border-[var(--color-border)]"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                                className="w-16 h-11 text-center text-sm font-medium text-[var(--color-text)] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setQuantity((q) => q + 1)}
                                                className="flex h-11 w-11 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] border-l border-[var(--color-border)]"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <a
                                            href={productUrl ?? '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-accent-dim)] hover:shadow-[0_6px_20px_rgba(11,95,170,0.25)]"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            Solicitar presupuesto
                                        </a>
                                    </div>
                                </div>

                                {/* Technical details */}
                                {(detail?.sku || detail?.weight) && (
                                    <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Datos tecnicos</div>
                                        <div className="mt-3 space-y-2.5">
                                            {detail.sku && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Tag className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                                                    <span className="text-[var(--color-text-muted)]">Referencia:</span>
                                                    <span className="font-medium text-[var(--color-text)]">{detail.sku}</span>
                                                </div>
                                            )}
                                            {detail.weight && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Ruler className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                                                    <span className="text-[var(--color-text-muted)]">Peso:</span>
                                                    <span className="font-medium text-[var(--color-text)]">{detail.weight}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Full description */}
                                {detail?.fullDescription && (
                                    <div className="mt-5">
                                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Descripcion completa</div>
                                        <div className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-line">
                                            {detail.fullDescription}
                                        </div>
                                    </div>
                                )}

                                {/* Error state */}
                                {error && (
                                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                        No se pudo cargar la ficha completa del fabricante. Se muestran los datos disponibles de la API.
                                    </div>
                                )}

                                {/* External link — subtle */}
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
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
