'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'Nosotros' },
    { href: '/configurator', label: 'Configurador' },
    { href: '/contact', label: 'Contacto' },
];

function AerolumeLogo({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 260 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="navWind1" x1="20" y1="22" x2="170" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0b5faa" stopOpacity="0" />
                    <stop offset="40%" stopColor="#0b5faa" />
                    <stop offset="100%" stopColor="#0b5faa" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="navWind2" x1="30" y1="32" x2="155" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0b5faa" stopOpacity="0" />
                    <stop offset="50%" stopColor="#0b5faa" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0b5faa" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d="M20,24 Q60,6 100,20 Q130,30 160,18" stroke="url(#navWind1)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M32,34 Q68,18 108,32 Q135,40 158,30" stroke="url(#navWind2)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M44,42 Q76,30 112,40 Q132,46 155,40" stroke="#0b5faa" strokeWidth="0.8" fill="none" opacity="0.2" strokeLinecap="round" />
            <circle cx="160" cy="18" r="2.5" fill="#0b5faa" opacity="0.9" />
            <circle cx="160" cy="18" r="6" fill="#0b5faa" opacity="0.1" />
            <text x="22" y="70" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" fontWeight="300" letterSpacing="8" fill="#0a1e3d">AEROLUME</text>
            <line x1="22" y1="78" x2="245" y2="78" stroke="#0b5faa" strokeWidth="0.5" opacity="0.2" />
        </svg>
    );
}

export function Navigation() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-white/92 backdrop-blur-xl border-b border-[var(--color-border)] shadow-[0_4px_30px_rgba(10,37,64,0.06)]'
                        : 'bg-transparent'
                }`}
            >
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    <Link href="/" className="group">
                        <AerolumeLogo className="h-12 w-auto" />
                    </Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-5 py-2.5 text-sm tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)] uppercase"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <Link
                        href="/configurator"
                        className="hidden lg:inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm tracking-[0.06em] text-white transition-all hover:bg-[var(--color-accent-dim)] hover:shadow-[0_8px_30px_rgba(11,95,170,0.25)]"
                    >
                        Configurar velas
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 text-[var(--color-text-secondary)]"
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </nav>
            </header>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-white/98 backdrop-blur-2xl lg:hidden"
                    >
                        <div className="flex flex-col items-center justify-center h-full gap-8">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="font-[var(--font-display)] text-4xl font-light tracking-[0.1em] text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors uppercase"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
