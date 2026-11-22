import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Film, Share2, TrendingUp, Radio, Users } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Magnetic } from "@/components/common/Magnetic";

interface ServiceCardData {
  id: string;
  index: string;
  tag: string;
  title: string;
  description: string;
  highlights: string[];
  to: string;
  icon: typeof ShieldCheck;
}

const SERVICES_DATA: ServiceCardData[] = [
  {
    id: "anti-piracy",
    index: "01",
    tag: "CONTENT PROTECTION",
    title: "Anti-Piracy & Rights Defense",
    description:
      "Enterprise-grade copyright defense powered by proprietary RightsHero technology. We detect, takedown, and protect original intellectual property across YouTube, social networks, IPTV, and global pirated streaming portals.",
    highlights: ["24/7 Real-Time Automated Crawlers", "Rapid Cross-Platform DMCA Takedowns", "Monetization Leak Recovery"],
    to: "/anti-piracy",
    icon: ShieldCheck,
  },
  {
    id: "media-production",
    index: "02",
    tag: "CREATIVE & PRODUCTION",
    title: "Full-Fledged Media Production",
    description:
      "Crafting high-impact visual narratives through Immersive Studio. From broadcast commercials and web series to cinematic brand stories and dynamic short-form video formats optimized for digital platforms.",
    highlights: ["End-to-End Conceptualization & Scripting", "Broadcast-Grade Cinematography & Post", "Multi-Platform Video Formats"],
    to: "/content-production",
    icon: Film,
  },
  {
    id: "content-management",
    index: "03",
    tag: "DISTRIBUTION & MONETIZATION",
    title: "Content Management & Monetization",
    description:
      "Maximizing revenue across digital catalog libraries. Certified YouTube multi-channel management, metadata architecture, rights verification, and strategic monetization pipelines across tier-one platforms.",
    highlights: ["Certified Partner Channel Management", "Global Revenue Optimization & Claiming", "Metadata & SEO Architecture"],
    to: "/content-management",
    icon: Radio,
  },
  {
    id: "growth-marketing",
    index: "04",
    tag: "PERFORMANCE & ACQUISITION",
    title: "Growth Marketing & Strategy",
    description:
      "Data-driven performance campaigns that propel brands forward. Combining audience segmentation, high-converting creative testing, and multi-channel attribution to turn impressions into scalable revenue.",
    highlights: ["Full-Funnel Paid Media Acquisition", "Conversion Rate Optimization (CRO)", "Real-Time Attribution & Analytics"],
    to: "/growth-marketing",
    icon: TrendingUp,
  },
  {
    id: "social-media",
    index: "05",
    tag: "COMMUNITY & ENGAGEMENT",
    title: "Social Media Ecosystems",
    description:
      "Transforming social presences into vibrant community engines. Creative asset production, always-on community management, real-time trend tapping, and brand resonance strategies.",
    highlights: ["Always-On Community Management", "Viral Short-Form Content Creation", "Brand Voice & Visual Identity Systems"],
    to: "/social-media",
    icon: Share2,
  },
  {
    id: "influencer-marketing",
    index: "06",
    tag: "CREATOR PARTNERSHIPS",
    title: "Influencer Marketing & Creator Alliances",
    description:
      "Direct relationships with top-tier MENA and international creators. Authentic brand integration, talent vetting, campaign orchestration, and measurable performance reporting.",
    highlights: ["Verified Tier-1 Creator Roster", "End-to-End Campaign Contracting", "Performance & Brand Lift Analytics"],
    to: "/influencers-marketing",
    icon: Users,
  },
];

function StickyServiceCard({
  service,
  index,
  total,
}: {
  service: ServiceCardData;
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Calculate dynamic sticky top position so each card stacks cleanly
  const topOffset = 88 + index * 20;

  const Icon = service.icon;

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
          {SERVICES_DATA.map((service, index) => (
            <StickyServiceCard
              key={service.id}
              service={service}
              index={index}
              total={SERVICES_DATA.length}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
