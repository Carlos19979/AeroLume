import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
