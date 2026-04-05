import type { Metadata } from 'next';
import SignupContent from './SignupContent';

export const metadata: Metadata = {
    title: 'Crear Cuenta',
};

export default function SignupPage() {
    return <SignupContent />;
}
