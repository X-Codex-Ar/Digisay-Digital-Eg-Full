import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export function ServiceHeroSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-background">
      {/* Ambient background brand glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <Container className="relative z-10">
        <motion.div
          className="max-w-4xl"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {page.name}
            </span>
          </motion.div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl xl:text-7xl">
            {page.heroTitle}
            {page.heroAccent ? (
              <span className="mt-3 block text-2xl font-semibold text-primary sm:text-3xl md:text-4xl">
                {page.heroAccent}
              </span>
            ) : null}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {page.summary}
          </p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
