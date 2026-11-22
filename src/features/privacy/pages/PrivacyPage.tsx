import type { ReactNode } from "react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { privacyBlocks, type PrivacyBlock } from "@/data/privacy";

// Group consecutive bullet blocks into a single <ul>, matching the original
// document structure (the extraction previously rendered them as loose divs).
function toElements(blocks: PrivacyBlock[]): ReactNode[] {
  const elements: ReactNode[] = [];
  let bulletGroup: PrivacyBlock[] = [];

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    elements.push(
      <ul
        key={`ul-${elements.length}`}
        className="mt-5 list-disc space-y-3 pl-6 text-sm leading-relaxed text-muted-foreground md:text-base"
      >
        {bulletGroup.map((b, i) => (
          <li key={i}>{b.text}</li>
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
        <h2 key={i} className="mt-10 text-2xl font-bold tracking-tight md:text-3xl">
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
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="pt-28 pb-16 sm:pt-36 sm:pb-24">
          <div className="mx-auto max-w-3xl">
            {/* The original page has no visible title; keep it for structure/a11y only. */}
            <h1 className="sr-only">Privacy Policy</h1>
            {toElements(privacyBlocks)}
          </div>
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
