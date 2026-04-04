import { Hero } from '@/components/landing/Hero';
import { LogoBar } from '@/components/landing/LogoBar';
import { ProductPillars } from '@/components/landing/ProductPillars';
import { DemoSection } from '@/components/landing/DemoSection';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function HomePage() {
    return (
        <>
            <Hero />
            <LogoBar />
            <ProductPillars />
            <DemoSection />
            <Pricing />
            <FAQ />
            <FinalCTA />
        </>
    );
}
