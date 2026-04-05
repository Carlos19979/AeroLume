import type { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
    title: 'Contacto',
    description: 'Contacta con el equipo de Aerolume. Estamos aquí para ayudarte a digitalizar tu velería.',
};

export default function ContactPage() {
    return <ContactContent />;
}
