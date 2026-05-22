import HomepageNavbar from "@/components/homepage/HomepageNavbar";
import HomepageHeroSection from "@/components/homepage/HomepageHeroSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import BuiltForPromotion from "@/components/homepage/BuiltForPromotion";
import PricingSection from "@/components/homepage/PricingSection";
import CTASection from "@/components/homepage/CTASection";
import HomepageFooterSection from "@/components/homepage/HomepageFooterSection";
import { appThemes } from "@/lib/themes";

export default function HomePage() {
  return (
    <main data-theme={appThemes.signalPurple} className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="theme-hero-glow absolute inset-0" />
        <HomepageNavbar />

        <HomepageHeroSection />        
      </section>

      <FeaturesSection />

      <HowItWorksSection />

      <BuiltForPromotion />

      <PricingSection />      

      <CTASection />

      <HomepageFooterSection />
    </main>
  );
}
