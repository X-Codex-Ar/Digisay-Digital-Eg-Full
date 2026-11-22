import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { ContactDetailsSection, ContactCtaSection, ContactIntroSection } from "../sections/ContactDetailsSection";
import { ContactForm } from "../components/ContactForm";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <ContactIntroSection />
      <ContactDetailsSection />
      <AnimatedSection className="border-t border-border/40">
        <ContactForm />
      </AnimatedSection>
      <ContactCtaSection />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
