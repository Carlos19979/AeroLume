'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Scroll-driven hero using pre-generated WebP frames.
 * No video decoding needed — just loads images and draws to canvas.
 * Much faster than extracting frames from video in the browser.
 */

const TOTAL_FRAMES = 66;
const FRAME_PATH = '/hero/frames/frame-';

const SCENES = [
    { start: 0.00, end: 0.20, title: 'El mar abierto.', subtitle: 'Donde empieza todo.' },
    { start: 0.25, end: 0.45, title: 'Tu barco.', subtitle: 'Cada modelo es unico.' },
    { start: 0.50, end: 0.70, title: 'La vela correcta.', subtitle: 'Precision en cada panel.' },
    { start: 0.78, end: 1.00, title: 'Configura ahora.', subtitle: 'Mas de 4.000 barcos. 9 tipos de vela.', cta: true },
];

function padNumber(n: number): string {
    return String(n).padStart(3, '0');
}

export function ScrollHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef(-1);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);

    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

    const drawFrame = useCallback((index: number) => {
        if (index === currentFrameRef.current) return;
        const canvas = canvasRef.current;
        const images = imagesRef.current;
        if (!canvas || !images.length) return;
        const i = Math.max(0, Math.min(images.length - 1, index));
        const img = images[i];
        if (!img?.complete) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentFrameRef.current = i;
    }, []);

    useMotionValueEvent(scrollYProgress, 'change', (p) => {
        if (imagesRef.current.length) drawFrame(Math.round(p * (imagesRef.current.length - 1)));
    });

    // Load all frame images
    useEffect(() => {
        const images: HTMLImageElement[] = [];
        let loaded = 0;

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `${FRAME_PATH}${padNumber(i)}.webp`;
            img.onload = () => {
                loaded++;
                setProgress(Math.round((loaded / TOTAL_FRAMES) * 100));

                // Draw first frame as soon as it loads
                if (i === 1 && canvasRef.current) {
                    canvasRef.current.width = img.naturalWidth;
                    canvasRef.current.height = img.naturalHeight;
                    canvasRef.current.getContext('2d')?.drawImage(img, 0, 0);
                    currentFrameRef.current = 0;
                }

                if (loaded === TOTAL_FRAMES) {
                    imagesRef.current = images;
                    // Set canvas size from first image
                    if (canvasRef.current) {
                        canvasRef.current.width = images[0].naturalWidth;
                        canvasRef.current.height = images[0].naturalHeight;
                    }
                    drawFrame(Math.round(scrollYProgress.get() * (TOTAL_FRAMES - 1)));
                    setReady(true);
                }
            };
            images.push(img);
        }
    }, [drawFrame, scrollYProgress]);

    // Scene text
    const textOpacities = SCENES.map((scene) =>
        useTransform(scrollYProgress, (p) => {
            if (p >= scene.start && p <= scene.end) return 1;
            if (p > scene.end && p < scene.end + 0.02) return Math.max(0, 1 - (p - scene.end) / 0.02);
            if (p < scene.start && p > scene.start - 0.02) return Math.max(0, 1 - (scene.start - p) / 0.02);
            return 0;
        })
    );

    const textYs = SCENES.map((scene) =>
        useTransform(scrollYProgress, (p) => {
            if (p < scene.start - 0.02) return 40;
            if (p > scene.end + 0.02) return -40;
            return -((p - scene.start) / (scene.end - scene.start)) * 20;
        })
    );

    const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
    const sceneIndex = useTransform(scrollYProgress, (p) => { for (let i = SCENES.length - 1; i >= 0; i--) { if (p >= SCENES[i].start) return i; } return 0; });

    return (
        <section ref={containerRef} className="relative" style={{ height: '500vh' }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a1628]">
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

                {/* Premium intro — shows brand while images load, first frame shows immediately */}
                <AnimatePresence>
                    {!ready && progress < 15 && (
                        <motion.div
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a1628]"
                        >
                            <div className="font-[var(--font-display)] text-4xl font-light tracking-[0.15em] text-white/80">
                                AEROLUME
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scene text */}
                {SCENES.map((scene, i) => (
                    <motion.div key={i} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: textOpacities[i] }}>
                        <motion.div className="text-center px-6 pointer-events-auto max-w-4xl" style={{ y: textYs[i] }}>
                            <h2 className="font-[var(--font-display)] text-[clamp(3rem,8vw,7.5rem)] font-light leading-[0.88] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.5)]">{scene.title}</h2>
                            <p className="mt-5 text-lg md:text-xl text-white/65 max-w-lg mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{scene.subtitle}</p>
                            {scene.cta && (
                                <div className="mt-10">
                                    <Link href="/configurator" className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--color-navy)] transition-all hover:shadow-[0_8px_50px_rgba(255,255,255,0.35)] hover:scale-[1.03]">
                                        Abrir configurador
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                ))}

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-48 h-[2px] bg-white/15 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-white/70 rounded-full" style={{ width: progressWidth }} />
                    </div>
                </div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-20 hidden md:flex">
                    {SCENES.map((_, i) => {
                        const dotO = useTransform(sceneIndex, (si) => Math.abs(si - i) < 0.6 ? 1 : 0.25);
                        const dotS = useTransform(sceneIndex, (si) => Math.abs(si - i) < 0.6 ? 1.6 : 1);
                        return <motion.div key={i} className="h-2 w-2 rounded-full bg-white" style={{ opacity: dotO, scale: dotS }} />;
                    })}
                </div>

                <motion.div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20" style={{ opacity: textOpacities[0] }}>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">Scroll</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="h-8 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
