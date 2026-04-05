import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex relative overflow-hidden bg-dark-gradient">
            {/* Grain texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-grain" />

            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.03] bg-dot-grid" />

            {/* Gradient orbs */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #4da3ff, transparent 65%)' }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #0b5faa, transparent 65%)' }} />

            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
                <Link href="/" className="flex items-center gap-2">
                    <Logo variant="light" />
                </Link>

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
