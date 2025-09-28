import { SectionSeparatorHorizontal } from '../components/SectionSeparator';
import { HeroSection } from '../components/HeroSection';
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

      <ProblemSection />

      <SectionSeparatorHorizontal />

      <SolutionSection />

      <SectionSeparatorHorizontal />

      <HowItWorksSection />

      <SectionSeparatorHorizontal />

      <CTASection />

      <Footer />
    </div>
  );
}
