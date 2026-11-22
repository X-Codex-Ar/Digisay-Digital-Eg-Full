import { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useAnimationFrame,
  type MotionValue,
} from "motion/react";
import { Container } from "@/components/common/Container";
import { marqueeServices } from "@/data/home";

function VelocityMarquee() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 300,
  });

  // Tilts (skews) based on scroll velocity
  const skewX = useTransform(smoothVelocity, [-2500, 2500], [-10, 10]);

  // Dynamic speed based on scroll velocity
  const baseX = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    // Base speed + velocity boost
    const v = smoothVelocity.get();
    const velocityFactor = v / 1000;
    const moveBy = (1.2 + Math.abs(velocityFactor) * 3) * (delta / 16.6);

    let newX = baseX.get() - moveBy;
    if (newX <= -1000) {
      newX = 0;
    }
    baseX.set(newX);
  });

  const duplicatedItems = [
    ...marqueeServices,
    ...marqueeServices,
    ...marqueeServices,
    ...marqueeServices,
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-border/40 bg-muted/20 py-4 select-none">
      <motion.div
        style={reduced ? {} : { x: baseX, skewX }}
        className="flex whitespace-nowrap gap-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground will-change-transform"
      >
        {duplicatedItems.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-center gap-6">
            <span className="transition-colors hover:text-[#d90a2c]">{item}</span>
            <span className="size-1.5 rounded-full bg-[#d90a2c]/70" aria-hidden="true" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Single word component for word-by-word scroll lighting
function LightUpWord({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <span className="relative mr-[0.28em] inline-block last:mr-0">
      <motion.span
        style={{ opacity, y }}
        className="inline-block transition-colors duration-150 text-foreground"
      >
        {word}
      </motion.span>
    </span>
  );
}

export function CompanyIntroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Scroll progress for the reading reveal paragraph
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.45"],
  });

  const introText =
    "Our clients describe us as a high-velocity powerhouse creating transformative digital experiences — uniting world-class media production, relentless copyright defense, and strategic audience growth across MENA and global platforms.";

  const words = introText.split(" ");

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Velocity-based Tilting Marquee Line */}
      <VelocityMarquee />

      {/* Word-by-word Reading Light-Up Section */}
      <Container className="py-20 md:py-28">
        <div ref={containerRef} className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d90a2c]">
            About DigiSay Group
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Full-Stack Media Solutions Built for the Next Era
          </h2>

          <div className="mt-8 text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl md:text-4xl">
            {reduced ? (
              <p className="text-foreground">{introText}</p>
            ) : (
              <p className="flex flex-wrap">
                {words.map((word, i) => {
                  const start = i / words.length;
                  const end = start + 1 / words.length;
                  return (
                    <LightUpWord
                      key={`${word}-${i}`}
                      word={word}
                      range={[start, end]}
                      progress={scrollYProgress}
                    />
                  );
                })}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
