'use client';

import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass, Gauge, Loader2, Search, Settings2, Wind, Anchor, ChevronDown, FileText } from 'lucide-react';
import type { Boat } from '@aerolume/shared';

/* ── Types ─────────────────────────────────────── */

type SailGroup = 'main' | 'head' | 'spi';
type SailKey = 'gvstd' | 'gvfull' | 'gve' | 'gse' | 'gn' | 'spiasy' | 'spisym' | 'furling' | 'gen';
type BoatMetricKey = SailKey | 'length' | 'p' | 'e' | 'i' | 'j';
type SailSelectionState = Record<SailGroup, SailKey>;
type SailAreaState = Record<SailGroup, string>;
type SailProduct = {
    id: string;
    name: string;
    price: number | null;
    priceTaxExc: number | null;
    image: string | null;
    link: string | null;
    highlights: string[];
    attributes: string[];
    onSale: boolean;
};

/* ── Constants ─────────────────────────────────── */

const DEFAULT_SELECTIONS: SailSelectionState = { main: 'gvstd', head: 'gse', spi: 'spiasy' };
const EMPTY_PRODUCTS: Record<SailGroup, SailProduct[]> = { main: [], head: [], spi: [] };

const SAIL_OPTIONS: Record<SailGroup, { value: SailKey; label: string; helper: string }[]> = {
    main: [
        { value: 'gvstd', label: 'Mayor clasica', helper: 'Equilibrada para crucero y uso general.' },
        { value: 'gvfull', label: 'Mayor full batten', helper: 'Mas estabilidad de perfil y control.' },
        { value: 'gve', label: 'Mayor enrollable', helper: 'Maniobra simple y reduccion rapida.' },
    ],
    head: [
        { value: 'gse', label: 'Genova enrollable', helper: 'La opcion mas facil para navegar comodo.' },
        { value: 'gn', label: 'Genova con mosquetones', helper: 'Montaje clasico y trimado directo.' },
    ],
    spi: [
        { value: 'spiasy', label: 'Spinnaker asimetrico', helper: 'Facil para popas abiertas y traveses.' },
        { value: 'spisym', label: 'Spinnaker simetrico', helper: 'Potencia pura cuando buscas rendimiento.' },
        { value: 'furling', label: 'Code S', helper: 'Portante enrollable y muy versatil.' },
        { value: 'gen', label: 'Gennaker / Code 0', helper: 'Muy util con poco viento.' },
    ],
};

const GROUP_META: Record<SailGroup, { title: string; intro: string; icon: typeof Wind; tag: string }> = {
    main: { title: 'Vela mayor', intro: 'Partimos de la geometria del barco y precargamos una superficie razonable.', icon: Wind, tag: 'Mayor' },
    head: { title: 'Vela de proa', intro: 'Compara opciones habituales sin perder la referencia de superficie.', icon: Compass, tag: 'Proa' },
    spi: { title: 'Portantes', intro: 'Elige la vela mas adecuada segun facilidad de uso y rango.', icon: Anchor, tag: 'Portantes' },
};

const RIG_METRICS: { key: Extract<BoatMetricKey, 'length' | 'p' | 'e' | 'i' | 'j'>; code: string; label: string }[] = [
    { key: 'length', code: 'LOA', label: 'Eslora total' },
    { key: 'p', code: 'P', label: 'Gratil mayor' },
    { key: 'e', code: 'E', label: 'Base mayor' },
    { key: 'i', code: 'I', label: 'Altura proa' },
    { key: 'j', code: 'J', label: 'Base proa' },
];

/* ── Utilities ─────────────────────────────────── */

const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const formatNumber = (value: string | null | undefined) => (!value ? '--' : Number.isNaN(Number(value)) ? value : Number(value).toFixed(2));
const formatDimension = (value: string | null | undefined, unit: 'm' | 'm²') => (!value ? '--' : `${formatNumber(value)} ${unit}`);
const formatPrice = (value: number | null) =>
    value === null ? 'Consultar' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const boatValue = (boat: Boat | null, key: BoatMetricKey) => (boat && typeof boat[key] === 'string' ? boat[key] : '');

/* ── Component ─────────────────────────────────── */

export default function SailConfigurator() {
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [results, setResults] = useState<Boat[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
    const [expertMode, setExpertMode] = useState(false);
    const [boatLength, setBoatLength] = useState('');
    const [selections, setSelections] = useState<SailSelectionState>(DEFAULT_SELECTIONS);
    const [areas, setAreas] = useState<SailAreaState>({ main: '', head: '', spi: '' });
    const [products, setProducts] = useState<Record<SailGroup, SailProduct[]>>(EMPTY_PRODUCTS);
    const [pendingHashBoat, setPendingHashBoat] = useState<string | null>(null);
    const [productLoading, setProductLoading] = useState<Record<SailGroup, boolean>>({ main: false, head: false, spi: false });
    const router = useRouter();

    /* ── Effects (identical logic) ── */

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const decodedHash = decodeURIComponent(window.location.hash.slice(1));
        if (!decodedHash) return;
        const [boatName, main, head, spi] = decodedHash.split('/');
        setSelections({
            main: SAIL_OPTIONS.main.some((o) => o.value === (main as SailKey)) ? (main as SailKey) : 'gvstd',
            head: SAIL_OPTIONS.head.some((o) => o.value === (head as SailKey)) ? (head as SailKey) : 'gse',
            spi: SAIL_OPTIONS.spi.some((o) => o.value === (spi as SailKey)) ? (spi as SailKey) : 'spiasy',
        });
        if (boatName) {
            setPendingHashBoat(boatName);
            setQuery(boatName);
        }
    }, []);

    useEffect(() => {
        const value = deferredQuery.trim();
        if (value.length < 2) {
            setResults([]);
            setSearchLoading(false);
            return;
        }
        const controller = new AbortController();
        setSearchLoading(true);
        fetch(`/api/boats/search?query=${encodeURIComponent(value)}`, { signal: controller.signal })
            .then(async (r) => (r.ok ? ((await r.json()) as Boat[]) : []))
            .then((boats) => setResults(boats))
            .catch((err) => err.name !== 'AbortError' && console.error('Boat search failed', err))
            .finally(() => setSearchLoading(false));
        return () => controller.abort();
    }, [deferredQuery]);

    useEffect(() => {
        if (!pendingHashBoat || results.length === 0) return;
        applyBoat(results.find((b) => normalizeText(b.model) === normalizeText(pendingHashBoat)) ?? results[0]);
        setPendingHashBoat(null);
    }, [pendingHashBoat, results]);

    useEffect(() => {
        if (!selectedBoat || typeof window === 'undefined') return;
        const hash = `${encodeURIComponent(selectedBoat.model)}/${selections.main}/${selections.head}/${selections.spi}`;
        window.history.replaceState(null, '', `#${hash}`);
    }, [selectedBoat, selections]);

    useEffect(() => {
        if (!selectedBoat || expertMode) return;
        setBoatLength(boatValue(selectedBoat, 'length'));
        setAreas({
            main: boatValue(selectedBoat, selections.main),
            head: boatValue(selectedBoat, selections.head),
            spi: boatValue(selectedBoat, selections.spi),
        });
    }, [expertMode, selectedBoat, selections]);

    useEffect(() => {
        if (!selectedBoat) {
            setProducts(EMPTY_PRODUCTS);
            return;
        }
        setProductLoading({ main: Boolean(boatLength && areas.main), head: Boolean(boatLength && areas.head), spi: Boolean(boatLength && areas.spi) });
        let cancelled = false;
        Promise.all((Object.keys(selections) as SailGroup[]).map(async (group) => {
            if (!boatLength || !areas[group]) return [group, [] as SailProduct[]] as const;
            const r = await fetch(`/api/sail-products?boatLength=${encodeURIComponent(boatLength)}&sail=${encodeURIComponent(selections[group])}&area=${encodeURIComponent(areas[group])}`);
            return [group, r.ok ? ((await r.json()) as SailProduct[]) : []] as const;
        }))
            .then((entries) => !cancelled && setProducts({
                main: entries.find(([g]) => g === 'main')?.[1] ?? [],
                head: entries.find(([g]) => g === 'head')?.[1] ?? [],
                spi: entries.find(([g]) => g === 'spi')?.[1] ?? [],
            }))
            .catch((err) => !cancelled && console.error('Product lookup failed', err))
            .finally(() => !cancelled && setProductLoading({ main: false, head: false, spi: false }));
        return () => { cancelled = true; };
    }, [selectedBoat, boatLength, areas, selections]);

    /* ── Handlers ── */

    function applyBoat(boat: Boat) {
        startTransition(() => {
            setSelectedBoat(boat);
            setQuery(boat.model);
            setResults([]);
            setBoatLength(boatValue(boat, 'length'));
            setAreas({ main: boatValue(boat, selections.main), head: boatValue(boat, selections.head), spi: boatValue(boat, selections.spi) });
        });
    }

    function updateSelection(group: SailGroup, sail: SailKey) {
        if (!selectedBoat) return;
        setSelections((c) => ({ ...c, [group]: sail }));
        setAreas((c) => ({ ...c, [group]: boatValue(selectedBoat, sail) }));
    }

    /* ── Render ── */

    return (
        <section className="relative min-h-screen overflow-hidden bg-[var(--color-surface)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(11,95,170,0.05),transparent_60%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-8 lg:pt-36">
                {/* ── Header ── */}
                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-accent)]/15 bg-[var(--color-accent-light)] px-4 py-2"
                        >
                            <Settings2 className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Configurador</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-6 font-[var(--font-display)] text-[clamp(3rem,6vw,5.5rem)] font-light leading-[0.9] text-[var(--color-text)]"
                        >
                            Encuentra la vela
                            <br />
                            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dim)] bg-clip-text text-transparent">
                                adecuada
                            </span>{' '}
                            para tu barco.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 max-w-lg text-base leading-relaxed text-[var(--color-text-secondary)]"
                        >
                            Busca tu modelo, revisa las cotas clave del aparejo y compara opciones reales con una lectura clara y moderna.
                        </motion.p>

                        {/* Active boat card */}
                        <AnimatePresence>
                            {selectedBoat && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                    className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-accent)]/15 bg-[var(--color-accent-light)] p-6"
                                >
                                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Barco activo</div>
                                    <div className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--color-text)]">
                                        {selectedBoat.model}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {RIG_METRICS.map((m) => (
                                            <span key={m.code} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs">
                                                <span className="text-[var(--color-text-muted)]">{m.code}</span>
                                                <span className="font-medium text-[var(--color-accent)]">{formatDimension(boatValue(selectedBoat, m.key), 'm')}</span>
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Search Sidebar ── */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_8px_40px_rgba(10,37,64,0.06)] lg:mt-6 lg:p-8"
                    >
                        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Paso 1</div>
                        <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light text-[var(--color-text)]">
                            Busca tu barco
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                            Selecciona un modelo para precargar dimensiones y superficies.
                        </p>

                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (selectedBoat && e.target.value !== selectedBoat.model) {
                                        setSelectedBoat(null);
                                        setBoatLength('');
                                        setAreas({ main: '', head: '', spi: '' });
                                        setProducts(EMPTY_PRODUCTS);
                                    }
                                }}
                                placeholder="Ej. WAARSCHIP 28LD"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-12 py-4 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]/40 focus:ring-2 focus:ring-[var(--color-accent)]/10"
                            />
                            {searchLoading && <Loader2 className="absolute right-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 animate-spin text-[var(--color-accent)]" />}
                        </div>

                        <AnimatePresence>
                            {results.length > 0 && !selectedBoat && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="mt-3 max-h-72 overflow-auto rounded-xl border border-[var(--color-border-strong)] bg-white shadow-[0_20px_60px_rgba(10,37,64,0.12)]"
                                >
                                    {results.map((boat) => (
                                        <button
                                            key={boat.id_sail_boat_type ?? boat.model}
                                            type="button"
                                            onClick={() => applyBoat(boat)}
                                            className="flex w-full items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[var(--color-accent-light)]"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-[var(--color-text)]">{boat.model}</div>
                                                <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                                    LOA {formatDimension(boat.length, 'm')}
                                                </div>
                                            </div>
                                            <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-[var(--color-text-muted)]" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mode toggle */}
                        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Modo</div>
                                    <div className="mt-1.5 text-base font-medium text-[var(--color-text)]">
                                        {expertMode ? 'Experto' : 'Guiado'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setExpertMode((c) => !c)}
                                    className={`rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] transition-all ${
                                        expertMode
                                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                                            : 'border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/30'
                                    }`}
                                >
                                    {expertMode ? 'Volver al guiado' : 'Activar experto'}
                                </button>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
                                {expertMode ? 'Puedes editar manualmente eslora y superficie.' : 'Las medidas se rellenan automaticamente.'}
                            </p>
                        </div>

                        {/* Rig metrics */}
                        <div className="mt-6">
                            <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Paso 2 — Cotas del aparejo</div>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {RIG_METRICS.map((metric) => (
                                    <div key={metric.code} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-md bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[var(--color-accent)]">
                                                {metric.code}
                                            </span>
                                        </div>
                                        <div className="mt-2 font-[var(--font-display)] text-xl text-[var(--color-text)]">
                                            {formatDimension(boatValue(selectedBoat, metric.key), 'm')}
                                        </div>
                                        <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                            {metric.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.aside>
                </div>

                {/* ── Sail Groups ── */}
                <div className="mt-16 space-y-10">
                    {(Object.keys(SAIL_OPTIONS) as SailGroup[]).map((group, groupIndex) => {
                        const meta = GROUP_META[group];
                        const Icon = meta.icon;

                        return (
                            <motion.section
                                key={group}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
                                className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_8px_40px_rgba(10,37,64,0.05)]"
                            >
                                {/* Section header */}
                                <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-accent-light)] to-white px-6 py-6 md:px-8">
                                    <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                        <Icon className="h-4 w-4" />
                                        {meta.tag}
                                    </div>
                                    <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light text-[var(--color-text)] md:text-4xl">
                                        {meta.title}
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                                        {meta.intro}
                                    </p>
                                </div>

                                <div className="px-6 py-6 md:px-8">
                                    {/* Sail type buttons */}
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {SAIL_OPTIONS[group].map((option) => {
                                            const selected = selections[group] === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => updateSelection(group, option.value)}
                                                    disabled={!selectedBoat}
                                                    className={`group relative rounded-xl border p-5 text-left transition-all duration-200 ${
                                                        selected
                                                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_8px_30px_rgba(11,95,170,0.25)]'
                                                            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/25 hover:shadow-[0_8px_25px_rgba(10,37,64,0.08)]'
                                                    } ${!selectedBoat ? 'cursor-not-allowed opacity-40' : ''}`}
                                                >
                                                    <div className={`font-[var(--font-display)] text-xl ${selected ? 'text-white' : 'text-[var(--color-text)]'}`}>
                                                        {option.label}
                                                    </div>
                                                    <p className={`mt-2 text-xs leading-relaxed ${selected ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                                                        {option.helper}
                                                    </p>
                                                    <div className={`mt-4 inline-flex rounded-md border px-2.5 py-1.5 text-[10px] uppercase tracking-wider ${
                                                        selected
                                                            ? 'border-white/25 text-white/80'
                                                            : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                                                    }`}>
                                                        {selectedBoat ? formatDimension(boatValue(selectedBoat, option.value), 'm²') : '-- m²'}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Data adjustment + Summary */}
                                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                            <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Ajuste de datos</div>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                                        Superficie activa
                                                    </label>
                                                    <div className="mt-1.5 flex items-center rounded-lg border border-[var(--color-border)] bg-white">
                                                        <input
                                                            type="text"
                                                            value={areas[group]}
                                                            onChange={(e) => setAreas((c) => ({ ...c, [group]: e.target.value }))}
                                                            disabled={!selectedBoat || !expertMode}
                                                            className="w-full bg-transparent px-4 py-3 font-[var(--font-display)] text-lg text-[var(--color-text)] outline-none disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)]"
                                                        />
                                                        <span className="px-4 text-xs text-[var(--color-text-muted)]">m²</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                                                        Eslora usada
                                                    </label>
                                                    <div className="mt-1.5 flex items-center rounded-lg border border-[var(--color-border)] bg-white">
                                                        <input
                                                            type="text"
                                                            value={boatLength}
                                                            onChange={(e) => setBoatLength(e.target.value)}
                                                            disabled={!selectedBoat || !expertMode}
                                                            className="w-full bg-transparent px-4 py-3 font-[var(--font-display)] text-lg text-[var(--color-text)] outline-none disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)]"
                                                        />
                                                        <span className="px-4 text-xs text-[var(--color-text-muted)]">m</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary panel */}
                                        <div className="rounded-xl border border-[var(--color-accent)]/15 bg-[var(--color-navy)] p-5 text-white">
                                            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Resumen</div>
                                            <div className="mt-2 font-[var(--font-display)] text-2xl text-white">
                                                {SAIL_OPTIONS[group].find((o) => o.value === selections[group])?.label}
                                            </div>
                                            <div className="mt-5 space-y-3 text-sm">
                                                {[
                                                    ['Superficie activa', formatDimension(areas[group], 'm²')],
                                                    ['Modo', expertMode ? 'Manual' : 'Automatico'],
                                                    ['Eslora usada', formatDimension(boatLength, 'm')],
                                                    ['Productos', productLoading[group] ? 'Buscando...' : `${products[group].length} opciones`],
                                                ].map(([label, val]) => (
                                                    <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0">
                                                        <span className="text-white/60">{label}</span>
                                                        <span className="font-medium text-white">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products grid */}
                                    <div className="mt-8">
                                        <div className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                                            Paso 3 — Productos
                                        </div>

                                        {productLoading[group] ? (
                                            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] py-16">
                                                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
                                                <span className="ml-3 text-sm text-[var(--color-text-muted)]">Buscando productos...</span>
                                            </div>
                                        ) : products[group].length > 0 ? (
                                            <div className="grid gap-5 xl:grid-cols-2">
                                                {products[group].map((product) => (
                                                    <article
                                                        key={product.id}
                                                        className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-white transition-all hover:shadow-[0_12px_40px_rgba(10,37,64,0.1)]"
                                                    >
                                                        {product.image && (
                                                            <div className="relative overflow-hidden bg-white">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="p-5">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
                                                                        Configuracion sugerida
                                                                    </div>
                                                                    <h4 className="mt-1.5 font-[var(--font-display)] text-xl text-[var(--color-text)]">
                                                                        {product.name}
                                                                    </h4>
                                                                </div>
                                                                <div className="shrink-0 rounded-lg border border-[var(--color-accent)]/15 bg-[var(--color-accent-light)] px-3 py-2 text-right">
                                                                    <div className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">Precio</div>
                                                                    <div className="mt-0.5 font-[var(--font-display)] text-lg text-[var(--color-accent)]">
                                                                        {formatPrice(product.price)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {product.highlights.length > 0 && (
                                                                <div className="mt-4 space-y-2">
                                                                    {product.highlights.map((h) => (
                                                                        <div key={h} className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                                                                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                                                                            <span>{h}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {product.attributes.length > 0 && (
                                                                <div className="mt-4 flex flex-wrap gap-1.5">
                                                                    {product.attributes.map((a) => (
                                                                        <span
                                                                            key={a}
                                                                            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]"
                                                                        >
                                                                            {a}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const params = new URLSearchParams();
                                                                    // Extract id_product from composite id (e.g., "3-262382" → "3")
                                                                    const pid = product.id.split('-')[0];
                                                                    if (pid) params.set('pid', pid);
                                                                    if (product.link) params.set('url', product.link);
                                                                    params.set('name', product.name);
                                                                    if (product.price !== null) params.set('price', String(product.price));
                                                                    if (product.image) params.set('image', product.image);
                                                                    if (product.highlights.length > 0) params.set('highlights', JSON.stringify(product.highlights));
                                                                    if (product.attributes.length > 0) params.set('attributes', JSON.stringify(product.attributes));
                                                                    router.push(`/configurator/product?${params.toString()}`);
                                                                }}
                                                                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-white transition-all hover:bg-[var(--color-accent-dim)] hover:shadow-[0_6px_20px_rgba(11,95,170,0.25)]"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                Ver ficha del producto
                                                            </button>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                                                {selectedBoat
                                                    ? 'No hay propuestas para esta combinacion. Cambia el tipo de vela o ajusta superficie en modo experto.'
                                                    : 'Selecciona primero un barco para ver las propuestas comerciales.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>
                        );
                    })}
                </div>
            </div>

        </section>
    );
}
