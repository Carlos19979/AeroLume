import type { Metadata } from 'next';
import LoginContent from './LoginContent';

export const metadata: Metadata = {
    title: 'Iniciar Sesión',
};

export default function LoginPage() {
    return <LoginContent />;
}
