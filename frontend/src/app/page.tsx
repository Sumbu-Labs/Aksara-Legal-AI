import { SectionSeparatorHorizontal } from '../components/SectionSeparator';
import { HeroSection } from '../components/HeroSection';
import { PartnersSection } from '../components/PartnersSection';
import { BenefitsSection } from '../components/BenefitsSection';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { CTASection } from '../components/CTASection';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <SectionSeparatorHorizontal />

      <PartnersSection />

      <SectionSeparatorHorizontal />

      <BenefitsSection />

      <SectionSeparatorHorizontal />

      <HowItWorksSection />

      <SectionSeparatorHorizontal />

      <ProblemSection />

      <SectionSeparatorHorizontal />

      <SolutionSection />

      <SectionSeparatorHorizontal />

      <CTASection />

      <Footer />
    </div>
  );
}
