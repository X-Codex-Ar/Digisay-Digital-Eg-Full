import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ServicePage as ServicePageType } from "@/data/services";

export function ServiceFeaturesSection({ page }: { page: ServicePageType }) {
  const features = page.features;
  if (!features) return null;
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading heading={features.heading} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {features.items.map((f, i) => (
            <div key={f.title} className="animate-none rounded-2xl border border-border bg-card p-5 shadow-sm" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-sm font-bold">{f.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
