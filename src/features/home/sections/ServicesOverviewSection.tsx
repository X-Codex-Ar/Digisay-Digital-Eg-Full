import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { homeServices } from "@/data/site";

export function ServicesOverviewSection() {
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading align="center" heading="What Can We Do to Your Business?" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {homeServices.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.04}>
              <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-xl">
                <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
                <Link
                  to={s.to as never}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
