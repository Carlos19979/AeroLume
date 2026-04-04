import { Hero } from '@/components/landing/Hero';
import { LogoBar } from '@/components/landing/LogoBar';
import { ProductPillars } from '@/components/landing/ProductPillars';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Results } from '@/components/landing/Results';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function HomePage() {
    return (
        <>
            <Hero />
            <LogoBar />
            <ProductPillars />
            <HowItWorks />
            <Results />
            <FAQ />
            <FinalCTA />
        </>
    );
}
