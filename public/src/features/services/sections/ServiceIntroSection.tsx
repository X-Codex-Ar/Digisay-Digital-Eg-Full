import { motion, useReducedMotion } from "motion/react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

export function ServiceIntroSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Strategic Value
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Engineered for Scalable Media & Commercial Impact
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {page.summary}. DigiSay couples proprietary algorithmic intelligence with deep
              localized industry expertise to protect, monetize, and accelerate your catalog across
              all digital ecosystems.
            </p>
          </motion.div>
        </div>

        {page.image && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5 transition-all hover:border-primary/40 hover:shadow-primary/10"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <ImageWithFallback
                src={page.image}
                alt={page.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            </div>
          </motion.div>
        )}
      </Container>
    </AnimatedSection>
  );
}
