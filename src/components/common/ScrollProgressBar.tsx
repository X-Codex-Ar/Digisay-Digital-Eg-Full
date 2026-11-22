import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-emerald-500 via-teal-400 to-primary shadow-[0_0_10px_rgba(16,185,129,0.7)]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
