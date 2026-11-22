import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import {
  ContactDetailsSection,
  ContactCtaSection,
  ContactIntroSection,
} from "../sections/ContactDetailsSection";
import { ContactForm } from "../components/ContactForm";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pt-28 pb-16 md:pt-36 space-y-12 md:space-y-16">
        <ContactIntroSection />
        <ContactDetailsSection />
        <AnimatedSection className="px-4 sm:px-6 xl:px-8">
          <ContactForm />
        </AnimatedSection>
        <ContactCtaSection />
      </main>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
