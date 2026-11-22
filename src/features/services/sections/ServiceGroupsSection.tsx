import { motion, useReducedMotion } from "motion/react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";

export function ServiceGroupsSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-16 sm:py-24">
        {page.groups.map((group) => {
          const isThreeCol = group.items.length === 3 || group.items.length >= 5;
          const gridColsClass = isThreeCol
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2";

          return (
            <div key={group.heading} className="mb-16 last:mb-0">
              <SectionHeading eyebrow={group.eyebrow} heading={group.heading} />
              <div className={`mt-10 grid gap-6 ${gridColsClass}`}>
                {group.items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.08,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="h-full"
                  >
                    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5">
                      {/* Ambient corner highlight */}
                      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

                      <div>
                        <div className="mb-4 h-1.5 w-8 rounded-full bg-primary/70 transition-all duration-300 group-hover:w-14 group-hover:bg-primary" />
                        <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                          {item.title}
                        </h3>
                        {item.lead && (
                          <p className="mt-2.5 text-sm font-semibold text-foreground/90">
                            {item.lead}
                          </p>
                        )}
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </AnimatedSection>
  );
}
