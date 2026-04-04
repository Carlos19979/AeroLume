import { ArrowRight } from 'lucide-react';
import { EmbedConfigurator } from '@/app/embed/configurator';

const DEMO_TENANT = {
    id: 'demo',
    name: 'Demo Aerolume',
    slug: 'demo',
    themeAccent: '#0b5faa',
    themeAccentDim: '#1a7fd4',
    themeNavy: '#0a2540',
    themeText: '#0a1e3d',
    themeFontDisplay: 'Cormorant',
    themeFontBody: 'Manrope',
    themeColorMain: '#3b82f6',
    themeColorHead: '#10b981',
    themeColorSpi: '#a855f7',
    logoUrl: null,
    locale: 'es',
    currency: 'EUR',
};

const DEMO_API_KEY = 'ak_26a3b7a817ba23d1fc9488daf2a154759bb66197';

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                            &larr; Volver
                        </a>
                        <span className="w-px h-4 bg-gray-200" />
                        <h1 className="text-sm font-semibold text-gray-900">Demo del configurador</h1>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        Modo demo
                    </span>
                </div>
            </div>

            {/* Configurator */}
            <div className="max-w-3xl mx-auto py-8 px-4">
                <EmbedConfigurator apiKey={DEMO_API_KEY} tenant={DEMO_TENANT} />
            </div>

            {/* CTA footer */}
            <div className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-cormorant)]">
                        ¿Te gusta lo que ves?
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Solicita tu propio configurador personalizado con tus productos y tu marca.
                    </p>
                    <a
                        href="/signup"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                        style={{ backgroundColor: '#0b5faa' }}
                    >
                        Solicitar demo
                        <ArrowRight size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
}
