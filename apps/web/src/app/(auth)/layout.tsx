import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex bg-[var(--color-paper)]">
            {/* Left panel — editorial branding */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-[var(--color-ink)] p-12 relative overflow-hidden shrink-0">
                {/* Subtle chart grid on dark */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(245,241,232,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,241,232,1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                    aria-hidden="true"
                />

                {/* Signal red accent line */}
                <div className="absolute top-0 left-0 w-full h-px bg-[var(--color-signal)] opacity-60" aria-hidden="true" />

                <Link href="/" className="relative flex items-center gap-2 z-10">
                    <Logo variant="light" />
                </Link>

                <div className="relative z-10 max-w-xs">
                    {/* Meta strip */}
                    <div className="flex items-center gap-3 mb-8">
                        <span
                            className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-signal)]"
                            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                        >
                            §01
                        </span>
                        <span className="h-px w-8 bg-[var(--color-signal)] opacity-40" />
                        <span
                            className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--color-paper)] opacity-40"
                            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                        >
                            Velerias
                        </span>
                    </div>

                    <h2
                        className="text-4xl xl:text-[2.75rem] font-light leading-[1.05] tracking-[-0.02em] text-[var(--color-paper)]"
                        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontFeatureSettings: '"ss01"' }}
                    >
                        El configurador
                        <br />
                        de velas{' '}
                        <em className="not-italic text-[var(--color-signal)]">que vende</em>
                        <br />
                        por ti.
                    </h2>

                    <p className="mt-5 text-sm leading-relaxed text-[var(--color-paper)] opacity-40">
                        Gestiona tu configurador, productos y presupuestos desde un solo lugar.
                    </p>
                </div>

                {/* Footer meta */}
                <div className="relative z-10 space-y-1">
                    <p
                        className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-paper)] opacity-25"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        Valencia · 39° N · Abril MMXXVI
                    </p>
                    <p
                        className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-paper)] opacity-20"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        &copy; {new Date().getFullYear()} Aerolume
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col">
                {/* Mobile logo bar */}
                <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-[var(--color-rule)]">
                    <Link href="/">
                        <Logo variant="dark" />
                    </Link>
                    <span
                        className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-ink-4)]"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        Aerolume · Acceso
                    </span>
                </div>

                {/* Top meta strip — desktop only */}
                <div className="hidden lg:flex items-center justify-between border-b border-[var(--color-rule)] px-12 py-2.5">
                    <span
                        className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-ink-4)]"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        Acceso · Edicion 04 / Vol. I
                    </span>
                    <span
                        className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-ink-4)]"
                        style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                    >
                        Aerolume · SaaS para velerias
                    </span>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    {children}
                </div>
            </div>
        </main>
    );
}
