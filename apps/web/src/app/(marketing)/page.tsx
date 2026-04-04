import { ScrollHero } from '@/components/home/ScrollHero';
import { StatsSection } from '@/components/home/StatsSection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { MarqueeSection } from '@/components/home/MarqueeSection';
import { QuoteSection } from '@/components/home/QuoteSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
    return (
        <>
            <ScrollHero />
            <StatsSection />
            <ProcessSection />
            <FeaturesSection />
            <MarqueeSection />
            <QuoteSection />
            <CTASection />
        </>
    );
}
