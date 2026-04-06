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
    { href: '/about', label: 'Nosotros' },
    { href: '/contact', label: 'Contacto' },
];

export function Navigation() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Only the home page has a dark hero — all other pages are white
    const hasDarkHero = pathname === '/';
    const isDark = hasDarkHero && !scrolled;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled || !hasDarkHero
                        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_1px_20px_rgba(0,0,0,0.04)]'
                        : 'bg-transparent'
                }`}
            >
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2">
                        <Logo variant={isDark ? 'light' : 'dark'} />
                    </Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-[13px] tracking-[0.05em] transition-all duration-300 rounded-lg ${
                                    isDark
                                        ? 'text-white/60 hover:text-white hover:bg-white/8'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            href="/login"
                            className={`px-4 py-2 text-[13px] tracking-[0.05em] transition-all duration-300 rounded-lg ${
                                isDark
                                    ? 'text-white/60 hover:text-white'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Acceder
                        </Link>
                        <Link
                            href="/signup"
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                                isDark
                                    ? 'bg-white text-[#0a2540] hover:shadow-lg hover:shadow-white/15'
                                    : 'bg-[#0a2540] text-white hover:shadow-lg hover:shadow-black/10'
                            }`}
                        >
                            Registrate
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={mobileOpen}
                        className={`lg:hidden p-2 transition-colors ${isDark ? 'text-white/70' : 'text-gray-600'}`}
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
                        className="fixed inset-0 z-40 lg:hidden"
                        style={{ background: 'linear-gradient(180deg, #0a2540, #0f3460)' }}
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
                                        className="text-3xl font-light tracking-[0.12em] text-white/70 hover:text-white transition-colors font-[family-name:var(--font-cormorant)]"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link
                                    href="/signup"
                                    onClick={() => setMobileOpen(false)}
                                    className="mt-4 inline-flex px-8 py-3 rounded-xl bg-white text-[#0a2540] text-sm font-semibold"
                                >
                                    Registrate
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
