import { motion, useReducedMotion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import type { ServicePage as ServicePageType } from "@/data/services";

export function ServicePartnerModelsSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();
  const partnerModels = page.partnerModels;
  if (!partnerModels) return null;

  return (
    <AnimatedSection className="border-t border-border/40 bg-background">
      <Container className="py-14 sm:py-20">
        <SectionHeading eyebrow="Partner Models" heading={partnerModels.heading} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {partnerModels.items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-full"
            >
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 sm:p-7">
                <div>
                  <div className="h-1.5 w-8 rounded-full bg-primary/70 transition-all duration-300 group-hover:w-12 group-hover:bg-primary mb-4" />
                  <h3 className="text-base font-bold text-foreground sm:text-lg">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function ServiceCtaSection({ eyebrow = "Ready to work with us?" }: { eyebrow?: string }) {
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20 py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-12 md:p-14 text-center shadow-lg">
          <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Let's build a customized solution for your media catalog.
          </h2>
          <div className="mt-8 flex justify-center">
            <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
          </div>
        </div>
      </Container>
    </AnimatedSection>
  );
}
