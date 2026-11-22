import { motion, useReducedMotion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { processSteps } from "@/data/site";

export function WorkflowSection() {
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading
          eyebrow="Proven process"
          heading="DigiSay Adopts a Proven Process to Transform Your Workflow for Goal-Driven Success"
        />
        <div className="mt-8 space-y-0">
          {processSteps.map((step, i) => (
            <motion.div
              key={step.title}
              className="grid gap-6 border-t border-border/40 py-10 md:grid-cols-3 md:gap-8"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
            >
              <div className="text-3xl font-bold text-muted-foreground md:text-5xl">{i + 1}</div>
              <h3 className="text-lg font-bold md:col-span-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground md:col-span-2">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
