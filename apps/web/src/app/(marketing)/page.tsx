import { Hero } from '@/components/landing/Hero';
import { ProductPillars } from '@/components/landing/ProductPillars';
import { ConfiguradorSection } from '@/components/landing/ConfiguradorSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Results } from '@/components/landing/Results';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function HomePage() {
    return (
        <>
            <Hero />
            <ProductPillars />
            <ConfiguradorSection />
            <HowItWorks />
            <Results />
            <FAQ />
            <FinalCTA />
        </>
    );
}
