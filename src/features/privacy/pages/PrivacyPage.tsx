import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { privacyBlocks, type PrivacyBlock } from "@/data/privacy";

function toElements(blocks: PrivacyBlock[]): ReactNode[] {
  const elements: ReactNode[] = [];
  let bulletGroup: PrivacyBlock[] = [];

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    elements.push(
      <ul
        key={`ul-${elements.length}`}
        className="mt-6 space-y-3.5 pr-0 pl-2 text-sm leading-relaxed text-muted-foreground md:text-base"
      >
        {bulletGroup.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{b.text}</span>
          </li>
        ))}
      </ul>,
    );
    bulletGroup = [];
  };

  blocks.forEach((b, i) => {
    if (b.type === "bullet") {
      bulletGroup.push(b);
      return;
    }
    flushBullets();
    if (b.type === "heading") {
      elements.push(
        <h2
          key={i}
          className="mt-12 text-2xl font-bold tracking-tight text-foreground md:text-3xl border-b border-border/40 pb-3"
        >
          {b.text}
        </h2>,
      );
    } else if (b.type === "subheading") {
      elements.push(
        <p key={i} className="mt-8 text-base font-bold text-foreground md:text-lg">
          {b.text}
        </p>,
      );
    } else {
      elements.push(
        <p key={i} className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          {b.text}
        </p>,
      );
    }
  });
  flushBullets();

  return elements;
}

export default function PrivacyPage() {
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16 bg-background">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <Container className="relative z-10 text-center">
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Legal & Compliance
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Privacy Policy & Terms
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Last updated: October 2024 · Transparency and trust in our digital media ecosystem.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Main Content Card */}
      <AnimatedSection className="border-t border-border/40 bg-muted/20 pb-20 sm:pb-28">
        <Container className="py-12">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card p-6 sm:p-10 md:p-14 shadow-sm">
            {toElements(privacyBlocks)}
          </div>
        </Container>
      </AnimatedSection>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
