import { motion, useReducedMotion } from "motion/react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";

export function ServiceGroupsSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/40">
      <Container className="py-14 sm:py-16">
        {page.groups.map((group, gi) => (
          <div key={group.heading} className="mb-12 last:mb-0">
            <SectionHeading eyebrow={group.eyebrow} heading={group.heading} />
            <ul className="mt-8 space-y-6">
              {group.items.map((item, i) => (
                <motion.li
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
                >
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  {item.lead && (
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.lead}</p>
                  )}
                  <p className="mt-3 text-base text-muted-foreground">{item.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </AnimatedSection>
  );
}
