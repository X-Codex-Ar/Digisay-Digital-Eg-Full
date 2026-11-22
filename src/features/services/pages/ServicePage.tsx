import type { ServicePage as ServicePageType } from "@/data/services";

import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";

import { ServiceHeroSection } from "../sections/ServiceHeroSection";
import { ServiceIntroSection } from "../sections/ServiceIntroSection";
import { ServiceGroupsSection } from "../sections/ServiceGroupsSection";
import { ServiceSpotlightSection } from "../sections/ServiceSpotlightSection";
import { ServiceStatsSection } from "../sections/ServiceStatsSection";
import { ServiceFeaturesSection } from "../sections/ServiceFeaturesSection";
import { ServicePartnerModelsSection, ServiceCtaSection } from "../sections/ServicePartnerModelsSection";

export default function ServicePage({ page }: { page: ServicePageType }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <ServiceHeroSection page={page} />
      <ServiceIntroSection page={page} />
      <ServiceGroupsSection page={page} />
      <ServiceSpotlightSection page={page} />
      <ServiceStatsSection page={page} />
      <ServiceFeaturesSection page={page} />
      <ServicePartnerModelsSection page={page} />
      <ServiceCtaSection />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
