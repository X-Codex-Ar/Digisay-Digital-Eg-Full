import React, { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "motion/react";
import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { PlayVideoButton } from "@/components/common/PlayVideoButton";
import { VideoModal } from "@/components/common/VideoModal";
import { brand } from "@/data/site";
import { hero, quickContact } from "@/data/home";

export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-linked shrink & fade for the hero
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.85], [1, 0.91]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.1]);
  const contentY = useTransform(scrollYProgress, [0, 0.85], [0, 60]);

  // Interactive mouse-following background glows in DigiSay Brand Red
  const springConfig = { damping: 28, stiffness: 65, mass: 0.15 };
  const mouseX = useSpring(400, springConfig);
  const mouseY = useSpring(250, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const titleWords = hero.title.split(" ");

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] overflow-hidden bg-background pt-24 md:pt-32"
    >
      {/* Dynamic ambient mouse-following glow effects (DigiSay Brand Red #d90a2c) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Glow 1 - Follows mouse directly (Brand Red tone) */}
        {!reduced && (
          <motion.div
            style={{
              x: mouseX,
              y: mouseY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="absolute size-[520px] rounded-full bg-[#d90a2c]/12 blur-[110px]"
          />
        )}

        {/* Glow 2 - Atmospheric complementary ambient glow */}
        <div className="absolute right-10 top-20 size-[420px] rounded-full bg-[#d90a2c]/8 blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 size-[360px] rounded-full bg-[#b80824]/6 blur-[100px]" />

        {/* Subtle high-tech grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main hero content container with scroll-linked shrink & fade */}
      <motion.div
        style={reduced ? {} : { scale, opacity, y: contentY }}
        className="relative z-10 origin-top"
      >
        <Container className="flex min-h-[calc(85vh-5rem)] flex-col justify-center py-12 md:py-16">
          {/* Eyebrow badge in rounded-2xl */}
          <motion.div
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1.5"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {hero.eyebrow}
            </span>
          </motion.div>

          {/* Heading with words sliding in one by one */}
          <h1 className="mt-6 max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl xl:text-[5rem] leading-[1.08]">
            {titleWords.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="inline-block overflow-hidden mr-[0.24em] last:mr-0 align-top"
              >
                <motion.span
                  className="inline-block"
                  initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 55 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.85,
                    delay: 0.12 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            DigiSay Group delivers comprehensive solutions that harness creativity, innovation, and
            strategy at every step of the customer journey, from concept to revenue generation.
          </motion.p>

          {/* Magnetic CTA buttons and Watch Video trigger */}
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
          >
            <PrimaryButton to="/contact" variant="hero" subtitle="Get In Touch">
              {hero.cta}
            </PrimaryButton>
            <PlayVideoButton
              onClick={() => setIsVideoOpen(true)}
              label="Watch Showreel"
              variant="hero"
            />
          </motion.div>

          {/* Quick contact strip */}
          <motion.div
            className="mt-14 grid max-w-2xl gap-4 border-t border-border/40 pt-6 sm:grid-cols-3"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: "easeOut" }}
          >
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">{quickContact.phone}</p>
              <p className="text-xs text-muted-foreground">{quickContact.phoneLabel}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">Sunday – Thursday</p>
              <p className="text-xs text-muted-foreground">9:00 AM – 5:00 PM EET</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">{brand.email}</p>
              <p className="text-xs text-muted-foreground">General inquiries</p>
            </div>
          </motion.div>
        </Container>
      </motion.div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="https://digisay.com/wp-content/uploads/2024/03/GFF-No-Logo-1.mp4"
        title="DigiSay Group • The Digital Media Solutions Leader"
      />
    </section>
  );
}
