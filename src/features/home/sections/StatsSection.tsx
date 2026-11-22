import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { homeStats } from "@/data/site";

// Counting hook that only counts when element is in view
function useInViewCounter(target: number, inView: boolean, durationMs = 1800) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(target);
      return;
    }
    if (!inView) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * easeProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, inView, durationMs, reduced]);

  return count;
}

// 3D Perspective Tilt Card with Specular Glare
function TiltStatCard({
  stat,
  index,
}: {
  stat: (typeof homeStats)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: false, amount: 0.3 });
  const reduced = useReducedMotion();
  const count = useInViewCounter(stat.value, inView);

  // Normalized mouse coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Glare percentage (0% to 100%)
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    damping: 20,
    stiffness: 200,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    damping: 20,
    stiffness: 200,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mousePosX = e.clientX - rect.left;
    const mousePosY = e.clientY - rect.top;

    x.set(mousePosX / rect.width - 0.5);
    y.set(mousePosY / rect.height - 0.5);

    glareX.set((mousePosX / rect.width) * 100);
    glareY.set((mousePosY / rect.height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={cardRef}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full"
    >
      <motion.div
        style={
          reduced
            ? {}
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }
        }
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
        whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-8 shadow-lg transition-colors duration-300 hover:border-[#d90a2c]/40 hover:shadow-2xl"
      >
        {/* Specular Glare Overlay in Brand Accent */}
        {!reduced && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-3xl opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 200px at ${glareX.get()}% ${glareY.get()}%, rgba(217, 10, 44, 0.25), transparent 80%)`,
            }}
          />
        )}

        {/* Ambient background accent */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#d90a2c]/5 blur-2xl transition-all group-hover:bg-[#d90a2c]/15" />

        <div className="relative z-10">
          {/* Animated Counter Display */}
          <div className="flex items-baseline">
            <span className="font-mono text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {count}
            </span>
            <span className="ml-1 text-3xl font-bold text-[#d90a2c] sm:text-4xl">
              {stat.suffix ?? ""}
            </span>
          </div>

          {/* Metric Label */}
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d90a2c]">
            {stat.label}
          </p>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {stat.body}
          </p>
        </div>

        {/* Bottom indicator line */}
        <div className="mt-6 h-1 w-12 rounded-full bg-border transition-all duration-300 group-hover:w-full group-hover:bg-[#d90a2c]" />
      </motion.div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="relative border-t border-border/40 bg-background py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Proven Impact"
          heading="DigiSay by the Numbers"
          description="A decade of pioneering digital media operations across the Middle East, North Africa, and global creator ecosystems."
          align="center"
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {homeStats.map((stat, i) => (
            <TiltStatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
