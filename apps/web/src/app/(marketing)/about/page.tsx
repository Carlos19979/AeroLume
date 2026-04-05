import type { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
    title: 'Sobre Nosotros',
    description: 'Conoce al equipo detrás de Aerolume, la plataforma de configuración de velas líder en el sector náutico.',
};

export default function AboutPage() {
    return <AboutContent />;
}
