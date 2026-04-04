import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                    Bienvenido{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}
                </h2>
                <p className="text-gray-500 mt-1">
                    Gestiona tu configurador de velas desde aquí.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                    title="Productos"
                    description="Gestiona tu catálogo de velas"
                    href="/dashboard/products"
                    count="—"
                />
                <DashboardCard
                    title="Presupuestos"
                    description="Consulta las solicitudes de presupuesto"
                    href="/dashboard/quotes"
                    count="—"
                />
                <DashboardCard
                    title="API Keys"
                    description="Gestiona tus claves de acceso"
                    href="/dashboard/api-keys"
                    count="—"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-3">Código de embebido</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Copia este snippet y pégalo en tu web para mostrar el configurador.
                </p>
                <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
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
        </div>
    );
}

function DashboardCard({
    title,
    description,
    href,
    count,
}: {
    title: string;
    description: string;
    href: string;
    count: string;
}) {
    return (
        <a
            href={href}
            className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-[var(--accent)] hover:shadow-md transition-all"
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{title}</h3>
                <span className="text-2xl font-semibold text-[var(--accent)]">{count}</span>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
        </a>
    );
}
