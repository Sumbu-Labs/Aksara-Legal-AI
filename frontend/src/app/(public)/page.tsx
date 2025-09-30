import { SectionSeparatorHorizontal } from '@/components/SectionSeparator';
import { HeroSection } from '@/components/HeroSection';
import { PartnersSection } from '@/components/PartnersSection';
import { BenefitsSection } from '@/components/BenefitsSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { PricingSection } from '@/components/PricingSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FAQSection } from '@/components/FAQSection';
import { ProblemSection } from '@/components/ProblemSection';
//import { SolutionSection } from '@/components/SolutionSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <SectionSeparatorHorizontal />

      <PartnersSection />

      <SectionSeparatorHorizontal />

      <ProblemSection />

      <SectionSeparatorHorizontal />

      <BenefitsSection />

      <SectionSeparatorHorizontal />

      <HowItWorksSection />

      <SectionSeparatorHorizontal />

      <TestimonialsSection />

      <SectionSeparatorHorizontal />

      <PricingSection />

      <SectionSeparatorHorizontal />

      <FAQSection />

      <SectionSeparatorHorizontal />

      {/* <SolutionSection />

      <SectionSeparatorHorizontal /> */}

      <CTASection />

      <Footer />
    </div>
  );
}
