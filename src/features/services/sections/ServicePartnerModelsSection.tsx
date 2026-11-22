import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import type { ServicePage as ServicePageType } from "@/data/services";

export function ServicePartnerModelsSection({ page }: { page: ServicePageType }) {
  const partnerModels = page.partnerModels;
  if (!partnerModels) return null;
  return (
    <AnimatedSection className="border-t border-border/40 bg-background">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Partner Models" heading={partnerModels.heading} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {partnerModels.items.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-bold text-foreground">{f.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function ServiceCtaSection({ eyebrow = "Ready to work with us?" }: { eyebrow?: string }) {
  return (
    <AnimatedSection className="border-t border-border/40 bg-foreground text-background">
      <Container className="py-14 sm:py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-background/70">
          {eyebrow}
        </p>
        <PrimaryButton to="/contact" className="mt-4 bg-primary">
          Let's Talk
        </PrimaryButton>
      </Container>
    </AnimatedSection>
  );
}
