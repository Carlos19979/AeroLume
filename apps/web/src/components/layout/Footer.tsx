import Link from 'next/link';

const FOOTER_LINKS = [
    {
        title: 'Navegacion',
        links: [
            { label: 'Inicio', href: '/' },
            { label: 'Configurador', href: '/configurator' },
            { label: 'Nosotros', href: '/about' },
            { label: 'Contacto', href: '/contact' },
        ],
    },
    {
        title: 'Servicios',
        links: [
            { label: 'Velas a medida', href: '/configurator' },
            { label: 'Mayor', href: '/configurator#main' },
            { label: 'Genova', href: '/configurator#head' },
            { label: 'Spinnaker', href: '/configurator#spi' },
        ],
    },
];

function FooterLogo() {
    return (
        <svg className="h-10 w-auto" viewBox="0 0 260 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ftWind1" x1="20" y1="22" x2="170" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                </linearGradient>
            </defs>
            <path d="M20,24 Q60,6 100,20 Q130,30 160,18" stroke="url(#ftWind1)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M32,34 Q68,18 108,32 Q135,40 158,30" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />
            <circle cx="160" cy="18" r="2.5" fill="#ffffff" opacity="0.7" />
            <text x="22" y="70" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" fontWeight="300" letterSpacing="8" fill="#ffffff">AEROLUME</text>
            <line x1="22" y1="78" x2="245" y2="78" stroke="#ffffff" strokeWidth="0.5" opacity="0.15" />
        </svg>
    );
}

export function Footer() {
    return (
        <footer className="relative bg-[var(--color-navy)]">
            <div className="glow-line opacity-40" />

            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
                    <div>
                        <FooterLogo />
                        <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
                            Configurador inteligente de velas. Busca tu barco, compara opciones y encuentra la vela perfecta para cada condicion.
                        </p>
                    </div>

                    {FOOTER_LINKS.map((group) => (
                        <div key={group.title}>
                            <h4 className="text-xs uppercase tracking-[0.2em] text-white/40">
                                {group.title}
                            </h4>
                            <ul className="mt-5 space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/60 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
                    <p className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} Aerolume. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <span className="text-xs text-white/40">Powered by sail data</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
