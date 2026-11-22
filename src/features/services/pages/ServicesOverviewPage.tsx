import { motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Film,
  ShieldCheck,
  TrendingUp,
  Video,
  Users,
  Share2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SectionHeading } from "@/components/common/SectionHeading";

interface ServiceCardItem {
  title: string;
  description: string;
  metric: string;
  href: string;
  icon: typeof Film;
}

const serviceOfferings: ServiceCardItem[] = [
  {
    title: "Full-stack Enterprise Media Management",
    description:
      "Comprehensive media operations, cross-platform distribution rights, and monetization across digital video and streaming networks.",
    metric: "36+ active media campaigns",
    href: "/content-management",
    icon: Film,
  },
  {
    title: "Anti-Piracy & Content Protection",
    description:
      "Automated copyright enforcement, real-time leak detection, and revenue recovery powered by RightsHero proprietary technology.",
    metric: "2M+ assets monitored & defended",
    href: "/anti-piracy",
    icon: ShieldCheck,
  },
  {
    title: "Growth Marketing & Data Analytics",
    description:
      "Performance-driven marketing strategies, audience acquisition, conversion funnels, and real-time attribution intelligence.",
    metric: "Scalable ROI-focused campaigns",
    href: "/growth-marketing",
    icon: TrendingUp,
  },
  {
    title: "Content Production & Studio Facilities",
    description:
      "End-to-end audiovisual production, state-of-the-art studio execution, post-production, and digital-first narrative crafting.",
    metric: "High-impact broadcast quality",
    href: "/content-production",
    icon: Video,
  },
  {
    title: "Influencer Marketing & Creator Ecosystem",
    description:
      "Strategic matchmaking between tier-one creators and top brands to spark organic cultural engagement across MENA.",
    metric: "100+ top creator partnerships",
    href: "/influencers-marketing",
    icon: Users,
  },
  {
    title: "Social Media Strategy & Engagement",
    description:
      "Data-backed social storytelling, community management, viral trend architecture, and high-velocity platform execution.",
    metric: "Omnichannel brand dominance",
    href: "/social-media",
    icon: Share2,
  },
];

const stats = [
  { value: "36+", label: "Active Enterprise Media Campaigns" },
  { value: "2M+", label: "Protected Digital Assets & Streams" },
  { value: "100+", label: "Top MENA Creator Network" },
  { value: "12+", label: "Years of Media-Tech Innovation" },
];

export default function ServicesOverviewPage() {
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <Container>
          <AnimatedSection>
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Comprehensive Capabilities
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                We make strategies, design & technology to create valuable media products.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                DigiSay is a full-stack media-tech enabling company in MENA. From enterprise rights
                monetization to algorithmic anti-piracy and viral growth marketing, we deliver
                tangible scale.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <PrimaryButton to="/contact">Let's Discuss Your Project</PrimaryButton>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="border-t border-border/40 bg-muted/20 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our Services"
            heading="Specialized Media & Technology Solutions"
            description="Explore our core service verticals engineered to unlock revenue, defend intellectual property, and amplify reach."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceOfferings.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="h-full"
                >
                  <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 sm:p-7">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-border/40 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {service.metric}
                      </p>
                      <Link
                        to={service.href as never}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-foreground transition-colors hover:text-primary group-hover:translate-x-1"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border/40 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Impact by the Numbers"
            heading="Proven Scale Across MENA"
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <span className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl group-hover:text-primary transition-colors">
                  {s.value}
                </span>
                <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Bottom CTA Box */}
      <section className="border-t border-border/40 bg-muted/30 py-16 sm:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-12 md:p-16 text-center shadow-lg">
            <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Ready to Accelerate?
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Let's craft the next chapter of your digital media presence.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Contact our team of experts to explore custom rights management, anti-piracy
              protection, and scalable growth strategies.
            </p>
            <div className="mt-8 flex justify-center">
              <PrimaryButton to="/contact">Get in Touch</PrimaryButton>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}