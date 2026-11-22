import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AgencyShowreelSection } from "@/components/common/AgencyShowreelSection";
import { HeroSection } from "../sections/HeroSection";
import { CompanyIntroSection } from "../sections/CompanyIntroSection";
import { ServicesOverviewSection } from "../sections/ServicesOverviewSection";
import { StatsSection } from "../sections/StatsSection";
import { WorkflowSection } from "../sections/WorkflowSection";
import { TestimonialsSection } from "../sections/TestimonialsSection";
import { LatestBlogSection } from "../sections/LatestBlogSection";
import { PartnersSection } from "../sections/PartnersSection";
import { ContactSection } from "../sections/ContactSection";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background overflow-x-clip">
      <SiteHeader />
      <HeroSection />
      <CompanyIntroSection />
      <AgencyShowreelSection />
      <ServicesOverviewSection />
      <StatsSection />
      <WorkflowSection />
      <TestimonialsSection />
      <PartnersSection />
      <LatestBlogSection />
      <ContactSection />
      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}
