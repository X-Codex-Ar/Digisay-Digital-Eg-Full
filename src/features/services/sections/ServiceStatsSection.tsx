import {motion, useReducedMotion} from "motion/react";

import { useCounter } from "@/hooks/use-counter";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ServicePage as ServicePageType } from "@/data/services";

function StatCard({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const count = useCounter(value);
  return (
    <div className="text-center">
      <p className="text-6xl font-bold text-foreground md:text-7xl">
        {count}
        {suffix && <span className="ml-1 text-xl font-semibold md:text-2xl">{suffix}</span>}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export function ServiceStatsSection({ page }: { page: ServicePageType }) {
  const stats = page.stats;
  if (!stats) return null;
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40 bg-foreground text-background">
      <Container className="py-14 sm:py-16">
        <SectionHeading align="center" heading={stats.heading} className="[&_h2]:text-white [&_p]:text-background/90" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <StatCard value={s.value} suffix={s.suffix} label={s.label} />
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
