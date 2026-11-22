import { motion, useReducedMotion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ServicePage as ServicePageType } from "@/data/services";

export function ServiceFeaturesSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();
  const features = page.features;
  if (!features) return null;

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-14 sm:py-20">
        <SectionHeading heading={features.heading} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.items.map((f, i) => (
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