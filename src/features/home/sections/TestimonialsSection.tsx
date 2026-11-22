import { Card, CardContent } from "@/components/ui/card";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { testimonials } from "@/data/home";

export function TestimonialsSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading align="center" heading="We help to achieve mutual goals." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="flex h-full flex-col gap-4 border border-border bg-card/60 p-6 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-foreground italic">"{t.quote}"</p>
              <div className="mt-auto">
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
