import { ArrowRight } from "lucide-react";

import { motion, useReducedMotion } from "motion/react";

import { PrimaryButton } from "./PrimaryButton";

type CTASectionProps = {
  eyebrow?: string;
  heading: string;
  description?: string;
  buttonLabel: string;
  buttonTo?: string;
  buttonHref?: string;
  className?: string;
};

export function CTASection({
  eyebrow,
  heading,
  description,
  buttonLabel,
  buttonTo = "/contact",
  className,
}: CTASectionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-[860px] rounded-3xl border border-border bg-background p-8 text-center shadow-lg md:p-12">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{heading}</h2>
        {description && <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{description}</p>}
        <PrimaryButton to={buttonTo} className="mt-8">
          {buttonLabel}
          <ArrowRight className="size-4" />
        </PrimaryButton>
      </div>
    </motion.section>
  );
}
