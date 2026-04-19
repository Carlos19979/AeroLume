'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const NAV_LINKS = [
    { href: '/#configurador', label: 'Configurador' },
    { href: '/#como-funciona', label: 'Como funciona' },
    { href: '/pricing', label: 'Precios', testId: 'pricing-nav-link' },
    { href: '/about', label: 'Nosotros' },
    { href: '/contact', label: 'Contacto' },
];

export function Navigation() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Home page hero is paper-coloured with a chart grid — nav can sit on top transparent
    // until scroll. All other pages get the bordered nav from the start.
    const onHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showBorder = scrolled || !onHome;

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
                    showBorder
                        ? 'bg-[var(--color-paper)]/92 backdrop-blur-md border-b border-[var(--color-rule)]'
                        : 'bg-transparent'
                }`}
            >
                {/* Top meta bar — feels like a publication masthead */}
                <div className="hidden lg:block border-b border-[var(--color-rule)]">
                    <div className="mx-auto max-w-[1400px] px-8 flex items-center justify-between text-[10.5px] tracking-[0.18em] uppercase font-mono text-[var(--color-ink-3)] py-1.5">
                        <span>Edicion 04 / Vol. I</span>
                        <span>Configurador embebible · Velerias · Espana</span>
                        <span>Valencia · 39° 28&apos; N</span>
                    </div>
                </div>

                <nav className="mx-auto max-w-[1400px] flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5">
                    <Link href="/" aria-label="Aerolume — inicio" className="shrink-0">
                        <Logo variant="dark" />
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                {...(link.testId ? { 'data-testid': link.testId } : {})}
                                className="text-[13px] tracking-[0.02em] text-[var(--color-ink-2)] hover:text-[var(--color-signal)] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-5">
                        <Link
                            href="/login"
                            className="text-[13px] tracking-[0.02em] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                        >
                            Acceder
                        </Link>
                        <Link
                            href="/signup"
                            className="group inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium tracking-[0.02em] text-[var(--color-paper)] bg-[var(--color-ink)] hover:bg-[var(--color-signal)] transition-colors"
                        >
                            Registrate
                            <span className="block h-px w-3 bg-[var(--color-paper)] transition-all group-hover:w-5" aria-hidden="true" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
                        aria-expanded={mobileOpen}
                        className="lg:hidden p-2 text-[var(--color-ink)]"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </nav>
            </header>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 lg:hidden bg-[var(--color-paper)]"
                    >
                        <div className="flex h-full flex-col px-6 pt-24 pb-10">
                            <ul className="flex flex-col gap-1 border-t border-[var(--color-rule)]">
                                {NAV_LINKS.map((link, i) => (
                                    <li key={link.href} className="border-b border-[var(--color-rule)]">
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            {...(link.testId ? { 'data-testid': link.testId } : {})}
                                            className="flex items-baseline justify-between py-5"
                                        >
                                            <span
                                                className="text-[2rem] tracking-[-0.01em] text-[var(--color-ink)]"
                                                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                                            >
                                                {link.label}
                                            </span>
                                            <span className="font-mono text-[11px] tracking-[0.15em] text-[var(--color-ink-3)]">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="border border-[var(--color-ink)] px-5 py-4 text-center text-[13px] tracking-[0.02em] text-[var(--color-ink)]"
                                >
                                    Acceder
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setMobileOpen(false)}
                                    className="bg-[var(--color-ink)] px-5 py-4 text-center text-[13px] tracking-[0.02em] text-[var(--color-paper)]"
                                >
                                    Registrate
                                </Link>
                            </div>

                            <p className="mt-auto label-mono">Aerolume / Edicion 04 / Vol. I</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
