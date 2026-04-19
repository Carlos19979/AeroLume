import type { Metadata } from 'next';
import { Cormorant, Manrope, Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
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

const fraunces = Fraunces({
    variable: '--font-fraunces',
    subsets: ['latin'],
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
});

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
});

const jetbrains = JetBrains_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
    title: {
        default: 'Aerolume | Configurador de Velas para Retailers Náuticos',
        template: '%s | Aerolume',
    },
    description: 'Plataforma SaaS de configuración de velas. Permite a tus clientes buscar barcos, configurar velas y generar presupuestos automáticamente.',
    openGraph: {
        title: 'Aerolume | Configurador de Velas',
        description: 'Plataforma SaaS de configuración de velas para retailers náuticos.',
        locale: 'es_ES',
        type: 'website',
        siteName: 'Aerolume',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Aerolume | Configurador de Velas',
        description: 'Plataforma SaaS de configuración de velas para retailers náuticos.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={`${cormorant.variable} ${manrope.variable} ${fraunces.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-white">
                {children}
                <SpeedInsights />
            </body>
        </html>
    );
}
