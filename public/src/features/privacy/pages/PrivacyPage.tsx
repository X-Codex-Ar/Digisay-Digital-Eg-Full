import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Globe,
  Database,
  BarChart3,
  UserCheck,
  Scale,
  ChevronDown,
  ChevronsUpDown,
  FileText,
} from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { privacySections, type PrivacyBlock } from "@/data/privacy";

const ICON_MAP = {
  Globe,
  Database,
  ShieldCheck,
  BarChart3,
  UserCheck,
  Scale,
};

function renderBlocks(blocks: PrivacyBlock[]): ReactNode[] {
  const elements: ReactNode[] = [];
  let bulletGroup: PrivacyBlock[] = [];

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    elements.push(
      <ul
        key={`ul-${elements.length}`}
        className="my-4 space-y-3 pl-1 text-sm leading-relaxed text-muted-foreground md:text-base"
      >
        {bulletGroup.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="text-foreground/90">{b.text}</span>
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
        <h3
          key={i}
          className="mt-6 text-xl font-bold tracking-tight text-foreground md:text-2xl border-b border-border/40 pb-2 first:mt-0"
        >
          {b.text}
        </h3>,
      );
    } else if (b.type === "subheading") {
      elements.push(
        <h4
          key={i}
          className="mt-6 text-base font-bold text-foreground md:text-lg text-primary/95 first:mt-0"
        >
          {b.text}
        </h4>,
      );
    } else {
      elements.push(
        <p
          key={i}
          className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:text-base first:mt-0"
        >
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
  // Section 1 ("overview") open by default, others collapsed
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview"]));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const areAllOpen = openSections.size === privacySections.length;

  const toggleAll = () => {
    if (areAllOpen) {
      setOpenSections(new Set(["overview"]));
    } else {
      setOpenSections(new Set(privacySections.map((s) => s.id)));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Unified Signature Page Header */}
      <PageHeader
        badge="Legal & Compliance"
        icon={ShieldCheck}
        title="Privacy Policy & Terms"
        description="Explore how DigiSay safeguards intellectual property and manages data across our digital solutions and creator ecosystem."
        meta={
          <>
            <span className="rounded-xl border border-border/80 bg-card/60 px-3 py-1 font-medium">
              Last Updated: August 2022
            </span>
            <span>·</span>
            <span className="rounded-xl border border-border/80 bg-card/60 px-3 py-1 font-medium">
              Governed under UAE & Egyptian Data Protection Laws
            </span>
          </>
        }
      />

      {/* Interactive Accordion Section */}
      <AnimatedSection className="border-t border-border/40 bg-muted/20 pb-20 sm:pb-28">
        <Container className="py-12 max-w-4xl">
          {/* Controls Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-border/40">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
              <FileText className="size-4 text-primary" />
              <span>{privacySections.length} Core Policy Sections</span>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary active:scale-95"
            >
              <ChevronsUpDown className="size-3.5 text-primary" />
              <span>{areAllOpen ? "Collapse Inactive" : "Expand All"}</span>
            </button>
          </div>

          {/* Accordion Cards List */}
          <div className="mt-8 space-y-4">
            {privacySections.map((section, idx) => {
              const isOpen = openSections.has(section.id);
              const Icon = ICON_MAP[section.iconName] || ShieldCheck;

              return (
                <motion.div
                  key={section.id}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.06,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-primary/50 bg-card shadow-lg shadow-primary/5"
                      : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
                  }`}
                >
                  {/* Collapsible Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                        {section.number}
                      </span>
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary transition-transform duration-300 group-hover:scale-105">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg truncate">
                          {section.title}
                        </h2>
                        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                          {section.summary}
                        </p>
                      </div>
                    </div>

                    {/* Animated Chevron Arrow */}
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                        isOpen
                          ? "border-primary/40 bg-primary/10 text-primary rotate-180"
                          : "border-border/60 bg-muted/30 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"
                      }`}
                    >
                      <ChevronDown className="size-4.5" />
                    </div>
                  </button>

                  {/* Collapsible Body with Framer Motion Animation */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.21, 0.47, 0.32, 0.98],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/40 bg-card/40 px-6 py-6 sm:px-8 space-y-4">
                          {renderBlocks(section.blocks)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Dedicated Questions & DPO Inquiries Card */}
          <div className="mt-14 rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center shadow-md">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Have Questions?
            </span>
            <h3 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
              Need Clarification on Your Personal Data or Privacy Rights?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Our legal and data compliance teams are ready to address your access requests, consent
              modifications, or inquiries within statutory timelines.
            </p>
            <div className="mt-6 flex justify-center">
              <PrimaryButton to="/contact">Contact Compliance Team</PrimaryButton>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
