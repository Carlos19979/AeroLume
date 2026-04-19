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
            <main className="flex-1 prose-body bg-[var(--color-paper)] text-[var(--color-ink)]">{children}</main>
            <Footer />
        </>
    );
}
