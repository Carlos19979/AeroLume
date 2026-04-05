interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function Logo({ size = 16, className = '', showText = true, variant = 'dark' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#0a2540]';
  const bgColor = variant === 'light' ? 'bg-white/10' : 'bg-[#0b5faa]';

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgColor}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2L4 20h16L12 2z" opacity="0.3" fill="white" />
          <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" />
        </svg>
      </div>
      {showText && (
        <span className={`text-lg font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-cormorant)] ${textColor}`}>
          Aerolume
        </span>
      )}
    </span>
  );
}
