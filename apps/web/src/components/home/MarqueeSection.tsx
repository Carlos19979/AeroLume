'use client';

import { motion } from 'framer-motion';

const BOATS_ROW_1 = [
    'BENETEAU FIRST 40.7', 'JEANNEAU SUN ODYSSEY 440', 'HANSE 388', 'BAVARIA 37 CRUISER',
    'DUFOUR 412', 'HALLBERG-RASSY 40', 'DEHLER 38', 'WAUQUIEZ CENTURION 40S',
    'X-YACHTS X4⁰', 'NAJAD 440', 'MOODY DS 45', 'SWAN 48',
];

const BOATS_ROW_2 = [
    'CATALINA 36', 'OCEANIS 46.1', 'ELAN GT5', 'GRAND SOLEIL 40',
    'Contest 42CS', 'ARCONA 410Z', 'SOUTHERLY 42', 'OYSTER 565',
    'DISCOVERY 55', 'FEELING 44', 'WAARSCHIP 28LD', 'RM 1270',
];

function MarqueeRow({ boats, direction = 'left', duration = 40 }: { boats: string[]; direction?: 'left' | 'right'; duration?: number }) {
    const items = [...boats, ...boats]; // Duplicate for seamless loop
    return (
        <div className="relative overflow-hidden">
            <motion.div
                className="flex gap-6 whitespace-nowrap"
                animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
                transition={{ duration, repeat: Infinity, ease: 'linear' }}
            >
                {items.map((boat, i) => (
                    <span
                        key={`${boat}-${i}`}
                        className="inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm text-[var(--color-text-secondary)] whitespace-nowrap"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]/40" />
                        {boat}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

export function MarqueeSection() {
    return (
        <section className="relative py-20 overflow-hidden bg-[var(--color-surface)]">
            <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                    Compatible con mas de 4.000 modelos
                </p>
            </div>

            <div className="space-y-4">
                <MarqueeRow boats={BOATS_ROW_1} direction="left" duration={45} />
                <MarqueeRow boats={BOATS_ROW_2} direction="right" duration={50} />
            </div>
        </section>
    );
}
