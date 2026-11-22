import { motion, useReducedMotion } from "motion/react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export function ServiceHeroSection({ page }: { page: ServicePageType }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-background">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <Container className="relative z-10">
        <motion.div
          className="max-w-4xl"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl xl:text-7xl">
            {page.heroTitle}
            {page.heroAccent ? (
              <span className="mt-3 block text-xl font-medium text-primary sm:text-2xl">
                {page.heroAccent}
              </span>
            ) : null}
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}