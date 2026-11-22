import type { ServicePage as ServicePageType } from "@/data/services";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export function ServiceHeroSection({ page }: { page: ServicePageType }) {
  return (
    <section className="relative min-h-[70vh] bg-background">
      <Container className="relative z-10 flex min-h-[calc(70vh-5rem)] flex-col justify-center py-12 md:py-16">
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-foreground md:text-6xl xl:text-7xl">
          {page.heroTitle}
          <span className="mt-2 block text-xl font-normal text-primary">{page.heroAccent}</span>
        </h1>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
        </div>
      </Container>
    </section>
  );
}

export function ServiceIntroSection({ page }: { page: ServicePageType }) {
  return (
    <AnimatedSection>
      <Container className="py-8 sm:py-12">
        {page.groups.map((g, i) => (
          <div key={g.heading} className="max-w-3xl">
            <SectionHeading eyebrow={g.eyebrow} heading={g.heading} />
            {g.items.slice(0, 2).map((item) => (
              <p key={item.title} className="text-base text-muted-foreground md:text-lg">
                {item.body}
              </p>
            ))}
          </div>
        ))}
      </Container>
    </AnimatedSection>
  );
}
