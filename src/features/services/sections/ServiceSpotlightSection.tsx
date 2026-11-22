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
    <AnimatedSection className="border-t border-border/40 bg-foreground text-background">
      <Container className="py-16 sm:py-24">
        <SectionHeading
          eyebrow={spotlight.eyebrow}
          heading={spotlight.heading}
          className="mb-6 text-white [&_h2]:text-white [&_p]:text-primary"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {spotlight.paragraphs.map((p, i) => (
            <motion.div
              key={p}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="text-base leading-relaxed text-background/90 md:text-lg">{p}</p>
            </motion.div>
          ))}
        </div>

        {spotlight.features && (
          <div className="mt-12">
            <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-6">
              Core Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {spotlight.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-white/[0.08] hover:-translate-y-1.5"
                >
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-base font-bold text-white transition-colors group-hover:text-primary">
                      {f.title}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-background/80">{f.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {spotlight.list && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-primary mb-6">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-bold uppercase tracking-wider text-white">
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
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:border-primary/40 hover:bg-white/[0.08]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
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
