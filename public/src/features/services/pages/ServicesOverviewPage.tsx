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
import { AgencyShowreelSection } from "@/components/common/AgencyShowreelSection";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { serviceOfferings, overviewStats } from "@/data/services";

const ICON_MAP = {
  Film,
  ShieldCheck,
  TrendingUp,
  Video,
  Users,
  Share2,
};

export default function ServicesOverviewPage() {
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Unified Signature Page Header */}
      <PageHeader
        badge="Comprehensive Capabilities"
        icon={Sparkles}
        title="We make strategies, design & technology to create valuable media products."
        description="DigiSay is a full-stack media-tech enabling company in MENA. From enterprise rights monetization to algorithmic anti-piracy and viral growth marketing, we deliver tangible scale."
      >
        <PrimaryButton to="/contact">Let's Discuss Your Project</PrimaryButton>
      </PageHeader>

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
              const Icon = ICON_MAP[service.iconName] || Film;
              return (
                <motion.div
                  key={service.title}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="h-full"
                >
                  <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 sm:p-7">
                    <div>
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-6" />
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

      {/* Agency Video Showreel Section */}
      <AgencyShowreelSection
        eyebrow="Media Excellence"
        title="See Our Creative & Distribution Powerhouse at Work"
        description="From premier entertainment networks to enterprise content owners, watch how DigiSay scales visual media across global digital channels."
      />

      {/* Stats Section */}
      <section className="border-t border-border/40 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Impact by the Numbers"
            heading="Proven Scale Across MENA"
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1.5"
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

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
