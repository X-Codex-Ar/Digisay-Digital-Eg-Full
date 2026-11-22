import type { ServicePage as ServicePageType } from "@/data/services";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";

export function ServiceIntroSection({ page }: { page: ServicePageType }) {
  return (
    <AnimatedSection>
      <Container className="py-12 sm:py-16">
        {page.groups.slice(0, 1).map((g) => (
          <div key={g.heading} className="max-w-3xl space-y-4">
            <SectionHeading eyebrow={g.eyebrow} heading={g.heading} />
            {g.items.slice(0, 2).map((item) => (
              <p key={item.title} className="text-base text-muted-foreground md:text-lg leading-relaxed">
                {item.body}
              </p>
            ))}
          </div>
        ))}
      </Container>
    </AnimatedSection>
  );
}