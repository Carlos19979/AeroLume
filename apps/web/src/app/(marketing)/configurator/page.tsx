import type { Metadata } from 'next';
import SailConfigurator from '@/components/configurator/SailConfigurator';

export const metadata: Metadata = {
    title: 'Configurador de Velas — Aerolume',
    description: 'Busca tu barco, revisa cotas del aparejo y compara opciones de velas a medida.',
};

export default function ConfiguratorPage() {
    return <SailConfigurator />;
}
