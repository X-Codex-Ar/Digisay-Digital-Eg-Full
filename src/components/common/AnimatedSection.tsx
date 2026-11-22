import type { ReactNode } from "react";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  margin?: string;
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  margin = "-60px 0px",
}: AnimatedSectionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn("w-full", className)}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 32 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
