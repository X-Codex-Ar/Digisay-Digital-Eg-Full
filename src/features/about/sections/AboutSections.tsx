import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import {
  aboutPartners,
  aboutTeamPhotos,
  awards,
  groupCompanies,
  groupCompanyLogos,
  values,
} from "@/data/site";

function ValuesCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 sm:p-8">
      <div>
        <div className="h-1.5 w-8 rounded-full bg-primary/70 transition-all duration-300 group-hover:w-14 group-hover:bg-primary mb-4" />
        <h3 className="text-lg font-bold break-words text-foreground group-hover:text-primary transition-colors sm:text-xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
      </div>
    </div>
  );
}

function GroupCompanyCard({ name, src, body }: { name: string; src: string; body: string }) {
  return (
    <div className="group flex h-full flex-col justify-between items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 sm:p-8">
      <div className="flex h-16 w-full items-center justify-center mb-4">
        <img
          src={src}
          alt={name}
          className="max-h-12 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="w-full min-w-0 mt-auto">
        <h3 className="text-lg font-bold break-words text-foreground group-hover:text-primary transition-colors sm:text-xl">
          {name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function AboutIntroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20 bg-background">
      {/* Ambient background brand glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <Container className="relative z-10">
        <motion.div
          className="max-w-4xl"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Company Story
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Pioneering Media-Tech & Creator Economies in MENA
          </h1>
          <div className="mt-6 space-y-5 text-base text-muted-foreground md:text-lg leading-relaxed">
            <p>
              DigiSay focuses on creator economy advancements which kickstarted the company's early
              days on YouTube with further business opportunities like working on the most
              successful and well-known projects in MENA's media industry.
            </p>
            <p>
              DigiSay has extensive expertise in managing complex media challenges through strategic
              and technology-based approaches.
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export function ValuesSection() {
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-16 sm:py-24">
        <SectionHeading eyebrow="Values" heading="Our Core Values" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="h-full"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <ValuesCard title={v.title} body={v.body} />
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function GroupCompaniesSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-16 sm:py-24">
        <SectionHeading eyebrow="Group Companies" heading="DigiSay Group Companies" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupCompanies.map((g, i) => {
            const logo = groupCompanyLogos.find((l) => l.name === g.name);
            return (
              <motion.div
                key={g.name}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="h-full"
              >
                <GroupCompanyCard
                  name={g.name}
                  body={g.body}
                  src={logo?.src ?? "/assets/brand/Digisay-logo-big.jpg"}
                />
              </motion.div>
            );
          })}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function AwardsSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-16 sm:py-24">
        <SectionHeading eyebrow="Awards & Recognition" heading="The awards won by our projects" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {awards.map((a, i) => (
            <motion.div
              key={a.title}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="h-full"
            >
              <div className="group flex h-full flex-col justify-between items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 sm:p-7">
                <div className="flex h-36 w-full items-center justify-center overflow-hidden">
                  <img
                    src={a.img}
                    alt={a.title}
                    className="max-h-32 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 mt-4 border-t border-border/40 pt-4 w-full">
                  <p className="text-base font-bold break-words text-foreground">
                    {a.title} <span className="font-semibold text-primary">({a.year})</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {a.by}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function TeamPhotosSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/20">
      <Container className="py-16 sm:py-24">
        <SectionHeading eyebrow="Team & Culture" heading="People Behind DigiSay" align="center" />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {aboutTeamPhotos.map((p, i) => (
            <motion.div
              key={p.src}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="overflow-hidden aspect-[16/10]">
                <img
                  src={p.src}
                  alt="DigiSay team"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function PartnersSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-16 sm:py-24">
        <SectionHeading
          eyebrow="Partners & Clients"
          heading="Our Partners Across MENA"
          align="center"
        />
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {aboutPartners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="group flex h-24 items-center justify-center rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <img
                src={p.src}
                alt={p.name}
                className="max-h-11 w-auto max-w-[85%] object-contain opacity-70 grayscale contrast-125 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
