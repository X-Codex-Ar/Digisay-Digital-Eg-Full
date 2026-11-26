import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Film, Sparkles, CheckCircle2 } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PlayVideoButton } from "@/components/common/PlayVideoButton";
import { VideoModal } from "@/components/common/VideoModal";

export interface AgencyShowreelSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  className?: string;
}

export function AgencyShowreelSection({
  eyebrow = "Experience DigiSay in Motion",
  title = "Where High-End Production Meets Algorithmic Distribution",
  description = "Watch our agency showreel to see how DigiSay Group transforms creative concepts into award-winning broadcasts, digital originals, and high-velocity commercial campaigns across MENA and the globe.",
  thumbnailUrl = "/assets/services/content-production-studio.jpg",
  videoUrl = "/assets/videos/showreel.mp4",
  className = "",
}: AgencyShowreelSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <AnimatedSection
      className={`relative overflow-hidden border-t border-border/40 py-20 sm:py-28 ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/8 blur-[140px]" />
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 mb-4"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h2
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {description}
          </motion.p>
        </div>

        {/* Video Card Preview */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 32 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="group relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xl shadow-primary/10 transition-all duration-500 hover:border-primary/50"
        >
          {/* 16:9 Thumbnail Container */}
          <div
            onClick={() => setIsOpen(true)}
            className="relative aspect-video w-full cursor-pointer overflow-hidden"
          >
            <img
              src={thumbnailUrl}
              alt={title}
              width={1280}
              height={720}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />

            {/* Dark gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/20 transition-opacity duration-300 group-hover:opacity-80" />

            {/* Central Pulse Play Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <PlayVideoButton
                onClick={() => setIsOpen(true)}
                variant="card"
                label="Play DigiSay Agency Showreel"
              />
              <span className="rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all group-hover:border-primary/60 group-hover:text-primary">
                Watch Official Reel • 4K
              </span>
            </div>

            {/* Bottom floating live tags */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-background/80 px-3 py-1.5 backdrop-blur-md border border-border/60">
                <Film className="size-4 text-primary" />
                <span className="font-semibold text-foreground">Immersive Productions</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="size-3.5 text-primary" /> 70B+ Views Powered
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="size-3.5 text-primary" /> 1,000+ Collaborations
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>

      {/* Video Modal instance */}
      <VideoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        videoUrl={videoUrl}
        title="DigiSay Media & Production Showreel"
      />
    </AnimatedSection>
  );
}
