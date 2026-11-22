import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { partners } from "@/data/site";

export function PartnersSection() {
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Clients & partners" heading="Trusted by leading brands" />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {partners.map((p) => (
            <img key={p.name} src={p.src} alt={p.name} className="h-10 w-auto object-contain" loading="lazy" />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
