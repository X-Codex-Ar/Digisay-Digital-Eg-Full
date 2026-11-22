import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { MessageSquare, ArrowUpRight, Mail, Phone } from "lucide-react";
import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { brand } from "@/data/site";

export function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Scroll-linked growth animation for the "Talk to us" box
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden border-t border-border/40 bg-background py-20 md:py-32"
    >
      <Container>
        {/* Growing "Talk to Us" Box in DigiSay Brand Palette */}
        <motion.div
          style={reduced ? {} : { scale, opacity, y }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#d90a2c]/40 bg-[#121418] p-8 sm:p-12 md:p-16 text-white shadow-[0_20px_70px_rgba(217,10,44,0.18)]"
        >
          {/* Animated Ambient Glows inside the box (Brand Crimson & Red) */}
          <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-[#d90a2c]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-[#d90a2c]/15 blur-3xl" />

          {/* Grid texture overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d90a2c]/40 bg-[#d90a2c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#d90a2c]">
              <MessageSquare className="size-3.5 text-[#d90a2c]" />
              <span>Let's Talk</span>
            </div>

            {/* Headline */}
            <h2 className="mt-6 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
              Amazing opportunities often arise from a conversation. Reach out and let's talk.
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-base text-stone-300 sm:text-lg">
              Whether you need automated anti-piracy protection, YouTube channel monetization, or
              breakthrough media production, our team is ready to scale your vision.
            </p>

            {/* Magnetic CTA Action */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                to="/contact"
                size="lg"
                className="bg-[#d90a2c] text-white hover:bg-[#b80824] shadow-[0_0_25px_rgba(217,10,44,0.45)]"
              >
                <span>Talk to Us Now</span>
              </PrimaryButton>
            </div>

            {/* Direct contact info chips */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-8 text-sm text-stone-300">
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="size-4 text-[#ff4d67]" />
                <span>{brand.email}</span>
                <ArrowUpRight className="size-3 text-[#ff4d67]" />
              </a>
              <span className="hidden sm:inline text-white/30">•</span>
              <a
                href={`tel:${brand.phone}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="size-4 text-[#ff4d67]" />
                <span>{brand.phone}</span>
                <ArrowUpRight className="size-3 text-[#ff4d67]" />
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
