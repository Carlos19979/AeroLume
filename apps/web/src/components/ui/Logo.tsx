interface LogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark';
}

/**
 * Editorial mark — wordmark with a signal mark and waterline rule.
 * No icon-in-rounded-square. Reads like a publication masthead.
 */
export function Logo({ className = '', showText = true, variant = 'dark' }: LogoProps) {
    const ink = variant === 'light' ? 'text-[var(--color-paper)]' : 'text-[var(--color-ink)]';
    const accent = variant === 'light' ? 'bg-[var(--color-paper)]' : 'bg-[var(--color-signal)]';
    const ruleColor = variant === 'light' ? 'bg-[var(--color-paper)]/35' : 'bg-[var(--color-rule-strong)]';

    if (!showText) {
        return (
            <span className={`inline-flex items-center ${className}`}>
                <span className={`block h-[10px] w-[10px] ${accent}`} aria-hidden="true" />
            </span>
        );
    }

    return (
        <span className={`inline-flex flex-col leading-none ${className}`}>
            <span className="inline-flex items-center gap-2.5">
                <span className={`block h-[8px] w-[8px] ${accent}`} aria-hidden="true" />
                <span
                    className={`text-[19px] font-medium tracking-[0.04em] ${ink}`}
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                    Aerolume
                </span>
            </span>
            <span className={`mt-[5px] ml-[18px] block h-px w-[80px] ${ruleColor}`} aria-hidden="true" />
        </span>
    );
}
