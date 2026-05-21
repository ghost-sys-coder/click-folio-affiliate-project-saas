import Link from "next/link";
import {
  ArrowRight,
  Check,
  TrendingUp,
} from "lucide-react";
import HomepageNavbar from "@/components/homepage/HomepageNavbar";
import HomepageHeroSection from "@/components/homepage/HomepageHeroSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import BuiltForPromotion from "@/components/homepage/BuiltForPromotion";
import PricingSection from "@/components/homepage/PricingSection";
import CTASection from "@/components/homepage/CTASection";
import HomepageFooterSection from "@/components/homepage/HomepageFooterSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070711] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.35),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_30%)]" />
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