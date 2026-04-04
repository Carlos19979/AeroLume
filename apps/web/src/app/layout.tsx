import type { Metadata } from 'next';
import { Cormorant, Manrope } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant({
    variable: '--font-cormorant',
    subsets: ['latin'],
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
});

const manrope = Manrope({
    variable: '--font-manrope',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Aerolume — Sail Configurator',
    description: 'Find the perfect sail for your boat. Search your model, review rig dimensions, and compare real product options.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-white">
                {children}
            </body>
        </html>
    );
}
