import { motion, useReducedMotion } from "motion/react";

import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { brand } from "@/data/site";
import { hero, quickContact } from "@/data/home";

export function HeroSection() {
  const reduced = useReducedMotion();
  return (
    <section className="relative min-h-[80vh] bg-background pt-20 md:pt-28">
      <Container className="relative z-10 flex min-h-[calc(80vh-5rem)] flex-col justify-center py-12 md:py-16">
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {hero.eyebrow}
        </motion.p>
        <motion.h1
          className="mt-4 max-w-4xl text-5xl font-bold tracking-tight text-foreground md:text-6xl xl:text-7xl"
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {hero.title}
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          DigiSay Group delivers comprehensive solutions that harness creativity, innovation, and
          strategy at every step of the customer journey, from concept to revenue generation
        </motion.p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryButton to="/contact">{hero.cta}</PrimaryButton>
          <SecondaryButton to="/anti-piracy">Anti-Piracy</SecondaryButton>
        </div>
        <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{quickContact.phone}</p>
            <p className="text-xs text-muted-foreground">{quickContact.phoneLabel}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{quickContact.hours}</p>
            <p className="text-xs text-muted-foreground">Server Time</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{brand.email}</p>
            <p className="text-xs text-muted-foreground">General inquiries</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
