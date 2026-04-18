'use client';

import Link from 'next/link';
import { Package, FileText, Ship, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { MetricCard } from '../components/metric-card';
import { FadeInUp } from '../components/animations';

export function DashboardClient({
    userName,
    metrics,
}: {
    userName: string;
    metrics: { products: number; quotes: number; boats: number; events: number };
}) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos dias' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

    return (
        <div className="space-y-8">
            {/* Greeting */}
            <FadeInUp>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {greeting}, {userName}
                    </h2>
                    <p className="text-gray-500 mt-1">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </FadeInUp>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FadeInUp delay={0.05}>
                    <MetricCard
                        title="Productos"
                        value={metrics.products}
                        icon={Package}
                        color="blue"
                        href="/dashboard/products"
                    />
                </FadeInUp>
                <FadeInUp delay={0.1}>
                    <MetricCard
                        title="Presupuestos"
                        value={metrics.quotes}
                        icon={FileText}
                        color="green"
                        href="/dashboard/quotes"
                    />
                </FadeInUp>
                <FadeInUp delay={0.15}>
                    <MetricCard
                        title="Barcos"
                        value={metrics.boats}
                        icon={Ship}
                        color="purple"
                        href="/dashboard/boats"
                    />
                </FadeInUp>
                <FadeInUp delay={0.2}>
                    <MetricCard
                        title="Eventos"
                        value={metrics.events}
                        icon={BarChart3}
                        color="amber"
                        href="/dashboard/analytics"
                    />
                </FadeInUp>
            </div>

            {/* Quick actions */}
            <FadeInUp delay={0.25}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/products"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-[var(--color-accent)]/30 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Plus size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Nuevo producto</p>
                            <p className="text-xs text-gray-500">Añadir al catalogo</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-gray-500 group-hover:text-[var(--color-accent)] transition-colors" />
                    </Link>
                    <Link
                        href="/dashboard/quotes"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Ver presupuestos</p>
                            <p className="text-xs text-gray-500">Gestionar solicitudes</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                    <a
                        href="/dashboard/api-keys"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-100 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Crear API Key</p>
                            <p className="text-xs text-gray-500">Para tu widget</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-gray-500 group-hover:text-violet-500 transition-colors" />
                    </a>
                </div>
            </FadeInUp>

            {/* Embed snippet */}
            <FadeInUp delay={0.3}>
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <h3 className="font-medium text-gray-900 mb-2">Codigo de embebido</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Copia este snippet y pegalo en tu web para mostrar el configurador.
                    </p>
                    <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto leading-relaxed">
{`<div id="aerolume-configurator"></div>
<script src="https://cdn.aerolume.com/widget/v1/aerolume.js"></script>
<script>
  Aerolume.init({
    apiKey: 'TU_API_KEY',
    container: '#aerolume-configurator',
  });
</script>`}
                    </pre>
                </div>
            </FadeInUp>
        </div>
    );
}
