import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Film, Share2, TrendingUp, Radio, Users } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Magnetic } from "@/components/common/Magnetic";
import { stackedServicesData } from "@/data/services";
import type { StackedServiceCardData } from "@/types/services";

const ICON_MAP = {
  ShieldCheck,
  Film,
  Radio,
  TrendingUp,
  Share2,
  Users,
};

function StickyServiceCard({
  service,
  index,
  total,
}: {
  service: StackedServiceCardData;
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Calculate dynamic sticky top position so each card stacks cleanly
  const topOffset = 88 + index * 20;

  const Icon = ICON_MAP[service.iconName] || ShieldCheck;

  return (
    <div
      ref={cardRef}
      style={{ top: `${topOffset}px` }}
      className="sticky mb-8 last:mb-0 transition-transform duration-200"
    >
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
        whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 md:p-12 shadow-xl backdrop-blur-sm"
      >
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#d90a2c]/8 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-2xl">
            {/* Tag & Index */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[#d90a2c]">
                {service.index} / {total < 10 ? `0${total}` : total}
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {service.tag}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {service.title}
            </h3>

            {/* Description */}
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {service.description}
            </p>

            {/* Feature highlights */}
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {service.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="size-1.5 rounded-full bg-[#d90a2c]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Magnetic CTA link */}
            <div className="mt-8">
              <Magnetic>
                <Link
                  to={service.to as never}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-[#d90a2c]/40 hover:bg-[#d90a2c]/10 hover:text-[#d90a2c]"
                >
                  <span>Explore service details</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* Right Icon Box */}
          <div className="hidden shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 p-6 md:flex">
            <Icon className="size-12 text-[#d90a2c]/85" strokeWidth={1.5} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ServicesOverviewSection() {
  return (
    <section className="relative border-t border-border/40 bg-muted/20 py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          heading="What We Can Do for Your Business"
          description="Discover our integrated suite of digital media, content protection, and growth engineering solutions designed to scale modern enterprises."
          align="center"
        />

        {/* Stacked Cards Deck Container */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {stackedServicesData.map((service, index) => (
            <StickyServiceCard
              key={service.id}
              service={service}
              index={index}
              total={stackedServicesData.length}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
