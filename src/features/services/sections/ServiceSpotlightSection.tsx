import { motion, useReducedMotion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ServicePage as ServicePageType } from "@/data/services";

export function ServiceSpotlightSection({ page }: { page: ServicePageType }) {
  const spotlight = page.spotlight;
  if (!spotlight) return null;
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40 bg-foreground text-background">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow={spotlight.eyebrow} heading={spotlight.heading} className="mb-4 text-white [&_h2]:text-white [&_p]:text-background/90" />
        <div className="mt-4 space-y-4">
          {spotlight.paragraphs.map((p) => (
            <motion.p
              key={p}
              className="text-base leading-relaxed text-background/90 md:text-lg"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {p}
            </motion.p>
          ))}
        </div>
        {spotlight.features && (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {spotlight.features.map((f) => (
              <li key={f.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="mt-2 text-sm text-background/85">{f.body}</p>
              </li>
            ))}
          </ul>
        )}
        {spotlight.list && (
          <div className="mt-8">
            <p className="text-sm font-bold text-white">{spotlight.list.heading}</p>
            <ul className="mt-2 space-y-1 text-sm text-background/85">
              {spotlight.list.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </AnimatedSection>
  );
}
