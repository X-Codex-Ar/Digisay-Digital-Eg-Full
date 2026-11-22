import { motion, useReducedMotion } from "motion/react";

import { useCounter } from "@/hooks/use-counter";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ServicePage as ServicePageType } from "@/data/services";

function StatCard({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix?: string | undefined;
  label: string;
}) {
  const count = useCounter(value);
  return (
    <div className="group flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 text-center">
      <p className="text-5xl font-black text-foreground group-hover:text-primary transition-colors sm:text-6xl md:text-7xl">
        {count}
        {suffix && <span className="ml-1 text-2xl font-bold text-primary">{suffix}</span>}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function ServiceStatsSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();
  const stats = page.stats;
  if (!stats) return null;

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-16 sm:py-24">
        <SectionHeading
          align="center"
          heading={stats.heading}
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-full"
            >
              <StatCard value={s.value} suffix={s.suffix} label={s.label} />
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
