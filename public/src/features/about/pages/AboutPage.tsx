import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AgencyShowreelSection } from "@/components/common/AgencyShowreelSection";
import {
  AboutIntroSection,
  ValuesSection,
  GroupCompaniesSection,
  AwardsSection,
  TeamPhotosSection,
  PartnersSection,
} from "../sections/AboutSections";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AboutIntroSection />
      <ValuesSection />
      <GroupCompaniesSection />
      <AgencyShowreelSection
        eyebrow="Inside DigiSay"
        title="Our Production Capabilities & Media Legacy"
        description="Explore the creative engine driving DigiSay Group. From broadcast-scale productions to cutting-edge digital media operations across the Middle East."
      />
      <AwardsSection />
      <TeamPhotosSection />
      <PartnersSection />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
