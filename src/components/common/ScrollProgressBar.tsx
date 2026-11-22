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
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#d90a2c] via-[#ff3b56] to-[#d90a2c] shadow-[0_0_10px_rgba(217,10,44,0.7)]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
