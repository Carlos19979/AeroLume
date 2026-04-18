'use client';

type Variant = 'cruising' | 'cruising_plus' | 'cruising_racing' | null;

type Palette = {
  cloth: string;
  clothDark: string;
  seam: string;
  patch: string;
  patchStroke: string;
  accent: string;
};

// Fabric tones per variant: Cruising = warm dacron, Plus = technical white,
// Racing = dark laminate/mylar with specular highlight.
const PALETTES: Record<string, Palette> = {
  cruising: {
    cloth: '#fbf7ef',
    clothDark: '#ebe3cf',
    seam: '#bfb59b',
    patch: '#e2d8bc',
    patchStroke: '#a59879',
    accent: '#b45309',
  },
  cruising_plus: {
    cloth: '#f7fafc',
    clothDark: '#d8e0ea',
    seam: '#9aa7b8',
    patch: '#cdd6e1',
    patchStroke: '#7a8595',
    accent: '#1d4ed8',
  },
  cruising_racing: {
    cloth: '#1c2028',
    clothDark: '#0b0d11',
    seam: '#586071',
    patch: '#2a3040',
    patchStroke: '#525867',
    accent: '#dc2626',
  },
};

type SailShape = 'main' | 'main_full_batten' | 'main_furling' | 'headsail' | 'spi_asym' | 'spi_sym' | 'code';

function sailShape(sailType: string): SailShape {
  switch (sailType) {
    case 'gvstd': return 'main';
    case 'gvfull': return 'main_full_batten';
    case 'gve': return 'main_furling';
    case 'gn':
    case 'gse': return 'headsail';
    case 'spiasy': return 'spi_asym';
    case 'spisym': return 'spi_sym';
    case 'furling':
    case 'gen': return 'code';
    default: return 'main';
  }
}

// Panel/seam cut style by variant.
function seamStyle(variant: Variant): 'horizontal' | 'radial' | 'mixed' {
  if (variant === 'cruising_racing') return 'radial';
  if (variant === 'cruising_plus') return 'mixed';
  return 'horizontal';
}

export function SailPreview({
  sailType,
  variant,
  accent,
  reefs,
}: {
  sailType: string;
  variant: Variant;
  accent: string;
  reefs?: number;
}) {
  const shape = sailShape(sailType);
  const palette = PALETTES[variant || 'cruising'] || PALETTES.cruising;
  const seams = seamStyle(variant);
  const isRacing = variant === 'cruising_racing';
  const uid = `${sailType}-${variant || 'cruising'}`;
  const showReefs = shape === 'main' || shape === 'main_full_batten';
  const reefCount = showReefs ? Math.max(0, Math.min(3, reefs ?? 2)) : 0;

  return (
    <div className="relative w-full rounded-2xl border border-gray-100 bg-white overflow-hidden">
      {/* Studio floor gradient (very subtle) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #f6f7f9 70%, #eef1f4 100%)' }}
      />

      <svg
        data-testid="embed-sail-svg"
        viewBox="0 0 400 500"
        xmlns="http://www.w3.org/2000/svg"
        className="relative block w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Fabric gradient — soft top-left light, darker bottom-right */}
          <linearGradient id={`cloth-${uid}`} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor={palette.cloth} />
            <stop offset="70%" stopColor={palette.cloth} />
            <stop offset="100%" stopColor={palette.clothDark} />
          </linearGradient>

          {/* Subtle specular highlight (thin diagonal band) */}
          <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isRacing ? 0.12 : 0.45} />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Fabric micro-texture (subtle noise via diagonal stripes) */}
          <pattern id={`weave-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={palette.seam} strokeWidth="0.3" opacity={isRacing ? 0.25 : 0.1} />
          </pattern>

          {/* Soft drop shadow under the sail */}
          <filter id={`shadow-${uid}`} x="-10%" y="-10%" width="120%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="2" dy="10" result="offset" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Floor shadow ellipse */}
        <ellipse cx="200" cy="475" rx="170" ry="7" fill="#000" opacity="0.08" />

        {shape === 'main' && (
          <MainTriangle uid={uid} palette={palette} seams={seams} withBattens={false} reefs={reefCount} />
        )}
        {shape === 'main_full_batten' && (
          <MainTriangle uid={uid} palette={palette} seams={seams} withBattens reefs={reefCount} />
        )}
        {shape === 'main_furling' && (
          <MainFurling uid={uid} palette={palette} seams={seams} />
        )}
        {shape === 'headsail' && (
          <Headsail uid={uid} palette={palette} seams={seams} withUvBand={sailType === 'gse'} />
        )}
        {shape === 'spi_asym' && (
          <SpiAsym uid={uid} palette={palette} seams={seams} />
        )}
        {shape === 'spi_sym' && (
          <SpiSym uid={uid} palette={palette} seams={seams} />
        )}
        {shape === 'code' && (
          <CodeSail uid={uid} palette={palette} seams={seams} narrow={sailType === 'gen'} />
        )}

        {/* Number on racing variants */}
        {isRacing && shape !== 'spi_sym' && (
          <text
            x="200"
            y="255"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="700"
            fontSize="40"
            fill={palette.accent}
            opacity="0.7"
          >
            ESP
          </text>
        )}
      </svg>

      {/* Accent underline to echo brand color */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 rounded-full"
        style={{ backgroundColor: accent, opacity: 0.6 }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────
   Sail shape sub-components
   Each draws: cloth fill + weave pattern + sheen + seams + corner patches
   ────────────────────────────────────────── */

function Corner({ cx, cy, r, fill, stroke, grommet = true }: { cx: number; cy: number; r: number; fill: string; stroke: string; grommet?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="0.8" />
      {grommet && <circle cx={cx} cy={cy} r={r * 0.35} fill="#d4d8df" stroke="#6c7280" strokeWidth="0.6" />}
      {grommet && <circle cx={cx} cy={cy} r={r * 0.2} fill="#1a1d22" />}
    </g>
  );
}

function MainTriangle({ uid, palette, seams, withBattens, reefs = 2 }: { uid: string; palette: Palette; seams: 'horizontal' | 'radial' | 'mixed'; withBattens: boolean; reefs?: number }) {
  // Mainsail triangle: vertical luff, horizontal foot, curved leech (roach)
  // Head (200, 40), Tack (120, 460), Clew (330, 460)
  // Slight luff curve inward, strong roach outward
  const path = `M 122 40
                L 122 460
                L 335 460
                C 320 360, 310 220, 200 90
                C 160 65, 140 48, 122 40 Z`;

  const battens = [
    { y1: 120, y2: 130 },
    { y1: 200, y2: 220 },
    { y1: 290, y2: 310 },
    { y1: 380, y2: 395 },
  ];

  return (
    <g filter={`url(#shadow-${uid})`}>
      {/* Cloth */}
      <path d={path} fill={`url(#cloth-${uid})`} stroke={palette.seam} strokeWidth="0.6" strokeLinejoin="round" />
      <path d={path} fill={`url(#weave-${uid})`} />
      <path d={path} fill={`url(#sheen-${uid})`} opacity="0.8" />

      {/* Seams */}
      {seams === 'horizontal' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.55" fill="none">
          {[90, 140, 190, 240, 290, 340, 390, 430].map((y, i) => (
            <line key={i} x1="122" y1={y} x2={335 - (460 - y) * 0.02} y2={y} />
          ))}
        </g>
      )}
      {seams === 'radial' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.6" fill="none">
          {/* Radial from clew */}
          <path d="M 335 460 L 122 120" />
          <path d="M 335 460 L 150 80" />
          <path d="M 335 460 L 195 55" />
          <path d="M 335 460 L 122 220" />
          <path d="M 335 460 L 122 320" />
          {/* Radial from head */}
          <path d="M 200 60 L 122 460" />
          <path d="M 200 60 L 180 460" />
          <path d="M 200 60 L 260 460" />
          <path d="M 200 60 L 320 460" />
          {/* Radial from tack */}
          <path d="M 122 460 L 335 460" opacity="0" />
          <path d="M 122 460 L 300 420" />
          <path d="M 122 460 L 250 380" />
        </g>
      )}
      {seams === 'mixed' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.5" fill="none">
          {[120, 180, 240, 300, 360, 410].map((y, i) => (
            <line key={i} x1="122" y1={y} x2="330" y2={y} />
          ))}
          {/* Radial clew patch lines */}
          <path d="M 335 460 L 200 380" />
          <path d="M 335 460 L 250 360" />
          <path d="M 335 460 L 290 340" />
        </g>
      )}

      {/* Battens (full-batten variant) */}
      {withBattens && (
        <g stroke={palette.seam} strokeWidth="1.2" fill="none" opacity="0.8">
          {battens.map((b, i) => (
            <line key={i} x1="125" y1={b.y1} x2={330 - i * 5} y2={b.y2} />
          ))}
        </g>
      )}

      {/* Reef lines (horizontal dashed rows with reinforcement grommets) */}
      {reefs > 0 && (() => {
        // Reef rows evenly distributed in lower half of sail (between tack and ~60% up).
        const baseY = 445;
        const step = 50;
        const rows: number[] = [];
        for (let i = 0; i < reefs; i++) rows.push(baseY - i * step);
        return (
          <g>
            {rows.map((y, i) => {
              // Leech x at this height (matching the curved leech)
              // Leech curve approximated: at y=460 → x≈335, at y=90 → x≈200.
              const t = (460 - y) / 370;
              const leechX = 335 - 135 * t - 15 * t * t;
              return (
                <g key={i}>
                  <line x1="125" y1={y} x2={leechX} y2={y} stroke={palette.seam} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.7" />
                  {/* Reef grommets every ~35px along the line */}
                  {Array.from({ length: Math.floor((leechX - 130) / 40) }).map((_, j) => (
                    <circle key={j} cx={140 + j * 40} cy={y} r="1.8" fill={palette.patchStroke} opacity="0.75" />
                  ))}
                  {/* Reef cringle at leech and luff (bigger grommet) */}
                  <circle cx="127" cy={y} r="3" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" />
                  <circle cx="127" cy={y} r="1.2" fill="#1a1d22" />
                  <circle cx={leechX - 4} cy={y} r="3" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" />
                  <circle cx={leechX - 4} cy={y} r="1.2" fill="#1a1d22" />
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* Corner patches (reinforcements) */}
      <path d="M 122 40 L 160 60 L 145 90 L 122 95 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 122 460 L 170 455 L 155 420 L 122 410 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 335 460 L 285 455 L 295 420 L 330 420 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />

      {/* Grommets */}
      <Corner cx={128} cy={48} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={128} cy={454} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={329} cy={454} r={5} fill={palette.patch} stroke={palette.patchStroke} />
    </g>
  );
}

function MainFurling({ uid, palette, seams }: { uid: string; palette: Palette; seams: 'horizontal' | 'radial' | 'mixed' }) {
  // Narrower, hollow leech (for rolling into mast), minimal roach
  const path = `M 160 40
                L 160 460
                L 305 460
                Q 260 280 205 130
                Q 185 75 160 40 Z`;

  return (
    <g filter={`url(#shadow-${uid})`}>
      <path d={path} fill={`url(#cloth-${uid})`} stroke={palette.seam} strokeWidth="0.6" strokeLinejoin="round" />
      <path d={path} fill={`url(#weave-${uid})`} />
      <path d={path} fill={`url(#sheen-${uid})`} opacity="0.7" />

      {seams === 'horizontal' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.5" fill="none">
          {[90, 150, 210, 270, 330, 400].map((y, i) => (
            <line key={i} x1="162" y1={y} x2={305 - (460 - y) * 0.07} y2={y} />
          ))}
        </g>
      )}
      {seams === 'radial' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.6" fill="none">
          <path d="M 305 460 L 162 120" />
          <path d="M 305 460 L 162 220" />
          <path d="M 305 460 L 162 320" />
          <path d="M 165 50 L 305 460" />
          <path d="M 165 50 L 250 460" />
          <path d="M 165 50 L 200 460" />
        </g>
      )}
      {seams === 'mixed' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.45" fill="none">
          {[140, 220, 300, 380].map((y, i) => (
            <line key={i} x1="162" y1={y} x2="300" y2={y} />
          ))}
        </g>
      )}

      {/* Vertical battens (short, typical of in-mast furling) */}
      <g stroke={palette.seam} strokeWidth="1" opacity="0.6" fill="none">
        <line x1="220" y1="120" x2="220" y2="160" />
        <line x1="240" y1="220" x2="240" y2="260" />
        <line x1="260" y1="320" x2="260" y2="360" />
      </g>

      {/* Patches */}
      <path d="M 160 40 L 190 55 L 180 90 L 160 95 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 160 460 L 200 455 L 190 420 L 160 410 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 305 460 L 265 455 L 270 420 L 300 425 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />

      <Corner cx={166} cy={48} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={166} cy={454} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={299} cy={454} r={5} fill={palette.patch} stroke={palette.patchStroke} />
    </g>
  );
}

function Headsail({ uid, palette, seams, withUvBand }: { uid: string; palette: Palette; seams: 'horizontal' | 'radial' | 'mixed'; withUvBand: boolean }) {
  // Large overlapping genoa: diagonal luff, horizontal foot, curved leech
  // Head (260, 40), Tack (50, 460), Clew (360, 460)
  const path = `M 260 40
                L 50 460
                L 360 460
                C 350 340, 320 200, 260 40 Z`;

  return (
    <g filter={`url(#shadow-${uid})`}>
      <path d={path} fill={`url(#cloth-${uid})`} stroke={palette.seam} strokeWidth="0.6" strokeLinejoin="round" />
      <path d={path} fill={`url(#weave-${uid})`} />
      <path d={path} fill={`url(#sheen-${uid})`} opacity="0.8" />

      {/* UV band (sunstop) along leech + foot for roller-furling genoa */}
      {withUvBand && (
        <g fill="#6b7b8c" opacity="0.55">
          {/* Leech band */}
          <path d="M 260 40
                   C 280 80, 320 220, 358 460
                   L 345 458
                   C 310 240, 275 100, 250 55 Z" />
          {/* Foot band */}
          <path d="M 50 460 L 360 460 L 355 448 L 62 448 Z" />
        </g>
      )}

      {seams === 'horizontal' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.5" fill="none">
          {[100, 160, 220, 280, 340, 400].map((y, i) => {
            const leftX = 260 - (y - 40) * (210 / 420);
            const rightOffset = (460 - y) * 0.12;
            return <line key={i} x1={leftX} y1={y} x2={360 - rightOffset} y2={y} />;
          })}
        </g>
      )}
      {seams === 'radial' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.55" fill="none">
          {/* From clew */}
          <path d="M 360 460 L 260 55" />
          <path d="M 360 460 L 180 200" />
          <path d="M 360 460 L 150 350" />
          <path d="M 360 460 L 60 440" />
          {/* From head */}
          <path d="M 260 55 L 80 450" />
          <path d="M 260 55 L 200 460" />
          <path d="M 260 55 L 300 460" />
          {/* From tack */}
          <path d="M 50 460 L 300 400" />
          <path d="M 50 460 L 260 300" />
        </g>
      )}
      {seams === 'mixed' && (
        <g stroke={palette.seam} strokeWidth="0.5" opacity="0.45" fill="none">
          {[120, 200, 280, 360].map((y, i) => {
            const leftX = 260 - (y - 40) * (210 / 420);
            return <line key={i} x1={leftX} y1={y} x2={355} y2={y} />;
          })}
          <path d="M 360 460 L 260 55" opacity="0.6" />
        </g>
      )}

      {/* Corner patches */}
      <path d="M 260 40 L 280 80 L 240 75 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 50 460 L 90 450 L 80 430 L 58 448 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 360 460 L 320 450 L 330 430 L 352 448 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />

      {/* Telltales (Windows) */}
      <g opacity="0.8">
        <rect x="160" y="260" width="20" height="14" fill="#ffffff" stroke={palette.seam} strokeWidth="0.4" opacity="0.5" />
      </g>

      <Corner cx={260} cy={48} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={58} cy={454} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={354} cy={454} r={5} fill={palette.patch} stroke={palette.patchStroke} />
    </g>
  );
}

function SpiAsym({ uid, palette, seams }: { uid: string; palette: Palette; seams: 'horizontal' | 'radial' | 'mixed' }) {
  // Asymmetric 3-point kite, bellied
  // Head (200, 40), Tack (60, 430), Clew (340, 430)
  const path = `M 200 40
                C 40 120, 40 380, 72 440
                C 100 450, 300 450, 330 440
                C 360 380, 360 120, 200 40 Z`;

  return (
    <g filter={`url(#shadow-${uid})`}>
      <path d={path} fill={`url(#cloth-${uid})`} stroke={palette.seam} strokeWidth="0.6" strokeLinejoin="round" />
      <path d={path} fill={`url(#weave-${uid})`} />
      <path d={path} fill={`url(#sheen-${uid})`} opacity="0.7" />

      {/* Radial vertical panels converging at head (typical spi cut) */}
      <g stroke={palette.seam} strokeWidth="0.5" opacity="0.5" fill="none">
        <path d="M 200 50 C 100 180, 80 350, 85 430" />
        <path d="M 200 50 C 140 180, 140 350, 140 440" />
        <path d="M 200 50 C 180 180, 190 350, 195 443" />
        <path d="M 200 50 C 220 180, 215 350, 210 443" />
        <path d="M 200 50 C 260 180, 260 350, 260 440" />
        <path d="M 200 50 C 300 180, 320 350, 315 430" />
      </g>

      {/* Head ring */}
      <circle cx="200" cy="50" r="6" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.8" />
      <circle cx="200" cy="50" r="2" fill="#1a1d22" />

      {/* Tack and clew patches */}
      <path d="M 72 440 L 110 435 L 100 415 L 68 430 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 330 440 L 290 435 L 300 415 L 332 430 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />

      <Corner cx={80} cy={435} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={322} cy={435} r={5} fill={palette.patch} stroke={palette.patchStroke} />
    </g>
  );
}

function SpiSym({ uid, palette, seams }: { uid: string; palette: Palette; seams: 'horizontal' | 'radial' | 'mixed' }) {
  // Symmetric diamond (star-cut / tri-radial symmetric)
  const path = `M 200 40
                C 60 150, 60 330, 200 430
                C 340 330, 340 150, 200 40 Z`;

  return (
    <g filter={`url(#shadow-${uid})`}>
      <path d={path} fill={`url(#cloth-${uid})`} stroke={palette.seam} strokeWidth="0.6" strokeLinejoin="round" />
      <path d={path} fill={`url(#weave-${uid})`} />
      <path d={path} fill={`url(#sheen-${uid})`} opacity="0.65" />

      {/* Tri-radial panel seams (symmetric) */}
      <g stroke={palette.seam} strokeWidth="0.5" opacity="0.55" fill="none">
        {/* From head */}
        <path d="M 200 50 C 120 160, 105 260, 120 330" />
        <path d="M 200 50 C 160 160, 155 280, 160 360" />
        <path d="M 200 50 L 200 380" />
        <path d="M 200 50 C 240 160, 245 280, 240 360" />
        <path d="M 200 50 C 280 160, 295 260, 280 330" />
        {/* From bottom (tack/clew merged) */}
        <path d="M 200 430 C 140 350, 100 240, 105 180" />
        <path d="M 200 430 C 260 350, 300 240, 295 180" />
        <path d="M 200 430 L 200 200" opacity="0.3" />
      </g>

      {/* Corner patches */}
      <circle cx="200" cy="50" r="6" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.8" />
      <circle cx="200" cy="50" r="2" fill="#1a1d22" />
      <circle cx="200" cy="420" r="6" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.8" />
      <circle cx="200" cy="420" r="2" fill="#1a1d22" />
    </g>
  );
}

function CodeSail({ uid, palette, seams, narrow }: { uid: string; palette: Palette; seams: 'horizontal' | 'radial' | 'mixed'; narrow: boolean }) {
  // Code Zero / Code Easy — tall, narrow, slightly bellied
  // Head (230, 40), Tack (60, 450), Clew (narrow ? 260 : 300, 450)
  const clewX = narrow ? 270 : 305;
  const path = `M 230 40
                C 100 150, 60 350, 70 445
                C 110 452, ${clewX - 20} 452, ${clewX} 445
                C ${clewX + 10} 340, 290 170, 230 40 Z`;

  return (
    <g filter={`url(#shadow-${uid})`}>
      <path d={path} fill={`url(#cloth-${uid})`} stroke={palette.seam} strokeWidth="0.6" strokeLinejoin="round" />
      <path d={path} fill={`url(#weave-${uid})`} />
      <path d={path} fill={`url(#sheen-${uid})`} opacity="0.7" />

      {/* Anti-torsion cable line along luff */}
      <path d="M 230 48 C 120 160, 80 350, 78 442" stroke={palette.accent} strokeWidth="1.5" fill="none" opacity="0.55" strokeLinecap="round" />

      {/* Radial seams */}
      <g stroke={palette.seam} strokeWidth="0.5" opacity="0.55" fill="none">
        <path d="M 230 50 C 150 180, 130 330, 130 440" />
        <path d="M 230 50 C 180 180, 175 340, 175 445" />
        <path d="M 230 50 L 220 445" />
        <path d="M 230 50 C 260 180, 260 340, 260 445" />
      </g>

      {/* Corner patches */}
      <path d="M 230 40 L 250 70 L 215 70 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d="M 70 445 L 100 440 L 95 425 L 68 435 Z" fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />
      <path d={`M ${clewX} 445 L ${clewX - 25} 440 L ${clewX - 20} 425 L ${clewX + 2} 435 Z`} fill={palette.patch} stroke={palette.patchStroke} strokeWidth="0.6" opacity="0.9" />

      <Corner cx={230} cy={50} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={78} cy={440} r={5} fill={palette.patch} stroke={palette.patchStroke} />
      <Corner cx={clewX - 8} cy={440} r={5} fill={palette.patch} stroke={palette.patchStroke} />
    </g>
  );
}
