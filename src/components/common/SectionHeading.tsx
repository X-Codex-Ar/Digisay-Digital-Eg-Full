import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  align?: "left" | "center";
  /** Heading tag. Use "h1" for a page's primary heading (one h1 per page for a11y). */
  level?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  subtitle,
  align = "left",
  level = "h2",
  className,
}: SectionHeadingProps) {
  const reduced = useReducedMotion();
  const HeadingTag = level;
  return (
    <motion.div
      className={cn("mb-8 sm:mb-12", align === "center" && "text-center", className)}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 22 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      {heading && (
        <HeadingTag className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem]">
          {heading}
        </HeadingTag>
      )}
      {subtitle && (
        <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">{subtitle}</p>
      )}
    </motion.div>
  );
}
