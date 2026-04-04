export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #040e1a 0%, #0a2540 40%, #0d3158 70%, #0a2540 100%)' }}>
            {/* Grain texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Gradient orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #4da3ff, transparent 65%)' }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #0b5faa, transparent 65%)' }} />

            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L4 20h16L12 2z" opacity="0.3" fill="white" />
                            <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-[0.15em] uppercase text-white font-[family-name:var(--font-cormorant)]">
                        Aerolume
                    </span>
                </a>

                <div className="max-w-md">
                    <h2 className="text-4xl font-bold text-white leading-[1.15] font-[family-name:var(--font-cormorant)]">
                        El configurador de velas{' '}
                        <span className="italic" style={{ color: '#7dd3fc' }}>que vende por ti</span>
                    </h2>
                    <p className="mt-4 text-white/40 leading-relaxed">
                        Gestiona tu configurador, productos y presupuestos desde un solo lugar.
                    </p>
                </div>

                <p className="text-xs text-white/20">
                    &copy; {new Date().getFullYear()} Aerolume. Todos los derechos reservados.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                {children}
            </div>
        </main>
    );
}
