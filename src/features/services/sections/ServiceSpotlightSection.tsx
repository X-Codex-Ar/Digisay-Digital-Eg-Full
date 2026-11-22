import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ServicePage as ServicePageType } from "@/data/services";

export function ServiceSpotlightSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();
  const spotlight = page.spotlight;
  if (!spotlight) return null;

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-16 sm:py-24">
        <SectionHeading eyebrow={spotlight.eyebrow} heading={spotlight.heading} className="mb-6" />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {page.slug === "anti-piracy" && (
            <motion.div
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative lg:col-span-5 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-end"
            >
              <div className="relative aspect-video lg:aspect-auto lg:h-full min-h-[220px] w-full overflow-hidden">
                <img
                  src="/assets/services/rightshero-cyber-shield.jpg"
                  alt="RightsHero Anti-Piracy Intelligence"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase text-primary">
                    RightsHero™ Engine
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    Autonomous Sentinel
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div
            className={`${
              page.slug === "anti-piracy" ? "lg:col-span-7" : "lg:col-span-12"
            } grid grid-cols-1 sm:grid-cols-2 gap-4`}
          >
            {spotlight.paragraphs.map((p, i) => (
              <motion.div
                key={p}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border/60 bg-card p-6 sm:p-7 shadow-sm transition-all hover:border-primary/30"
              >
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{p}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {spotlight.features && (
          <div className="mt-14">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Core Capabilities
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {spotlight.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5"
                >
                  <div>
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <ShieldCheck className="size-5" />
                    </div>
                    <p className="text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                      {f.title}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {spotlight.list && (
          <div className="mt-14 rounded-3xl border border-border/60 bg-card p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                {spotlight.list.heading}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {spotlight.list.items.map((it, i) => (
                <motion.div
                  key={it}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm font-medium text-foreground/90 transition-all hover:border-primary/40 hover:bg-muted/60"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span>{it}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </AnimatedSection>
  );
}
