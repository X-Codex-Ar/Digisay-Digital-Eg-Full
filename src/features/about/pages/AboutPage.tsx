import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AboutIntroSection, ValuesSection, GroupCompaniesSection, AwardsSection, TeamPhotosSection, PartnersSection } from "../sections/AboutSections";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AboutIntroSection />
      <ValuesSection />
      <GroupCompaniesSection />
      <AwardsSection />
      <TeamPhotosSection />
      <PartnersSection />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
