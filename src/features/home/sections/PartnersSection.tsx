import { motion, useReducedMotion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { partners } from "@/data/site";

export function PartnersSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-14 sm:py-20">
        <SectionHeading
          eyebrow="Clients & partners"
          heading="Trusted by leading brands"
          align="center"
        />
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group flex h-24 items-center justify-center rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <img
                src={p.src}
                alt={p.name}
                className="max-h-11 w-auto max-w-[85%] object-contain opacity-70 grayscale contrast-125 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
