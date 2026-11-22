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
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-12 md:p-16 text-card-foreground shadow-2xl transition-colors hover:border-primary/40"
        >
          {/* Subtle ambient brand glow inside the box */}
          <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />

          {/* Grid texture overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Pill badge in rounded-2xl */}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <MessageSquare className="size-3.5 text-primary" />
              <span>Let's Talk</span>
            </div>

            {/* Headline */}
            <h2 className="mt-6 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight text-foreground">
              Amazing opportunities often arise from a conversation. Reach out and let's talk.
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Whether you need automated anti-piracy protection, YouTube channel monetization, or
              breakthrough media production, our team is ready to scale your vision.
            </p>

            {/* Magnetic CTA Action */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                to="/contact"
                size="lg"
                className="shadow-[0_0_25px_rgba(217,10,44,0.35)]"
              >
                <span>Talk to Us Now</span>
              </PrimaryButton>
            </div>

            {/* Direct contact info chips */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-border/50 pt-8 text-sm text-muted-foreground">
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="size-4 text-primary" />
                <span>{brand.email}</span>
                <ArrowUpRight className="size-3 text-primary" />
              </a>
              <span className="hidden sm:inline text-muted-foreground/40">•</span>
              <a
                href={`tel:${brand.phone}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Phone className="size-4 text-primary" />
                <span>{brand.phone}</span>
                <ArrowUpRight className="size-3 text-primary" />
              </a>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
