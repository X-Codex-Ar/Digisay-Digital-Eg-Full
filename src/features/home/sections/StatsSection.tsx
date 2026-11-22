import { useCounter } from "@/hooks/use-counter";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { homeStats } from "@/data/site";

function StatCard({ stat }: { stat: (typeof homeStats)[number] }) {
  const count = useCounter(stat.value);
  return (
    <div className="text-center">
      <p className="text-6xl font-bold tracking-tight text-foreground md:text-7xl xl:text-8xl">
        {count}
        <span className="ml-1 text-4xl font-semibold md:text-5xl">{stat.suffix ?? ""}</span>
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{stat.body}</p>
    </div>
  );
}

export function StatsSection() {
  return (
    <AnimatedSection className="border-t border-border/40 bg-background">
      <Container className="py-14 sm:py-16">
        <SectionHeading align="center" heading="DigiSay by the numbers" />
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {homeStats.map((s) => (
            <AnimatedSection key={s.label} delay={0.1}>
              <StatCard stat={s} />
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
