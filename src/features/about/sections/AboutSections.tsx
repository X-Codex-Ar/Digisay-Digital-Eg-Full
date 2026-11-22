import { motion, useReducedMotion } from "motion/react";

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
    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 sm:p-7">
      <div>
        <div className="h-1.5 w-8 rounded-full bg-primary/70 transition-all duration-300 group-hover:w-12 group-hover:bg-primary mb-4" />
        <h3 className="text-lg font-bold break-words text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function GroupCompanyCard({ name, src, body }: { name: string; src: string; body: string }) {
  return (
    <div className="group flex h-full flex-col justify-between items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 sm:p-7">
      <div className="flex h-16 w-full items-center justify-center mb-2">
        <img
          src={src}
          alt={name}
          className="max-h-12 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="w-full min-w-0 mt-auto">
        <h3 className="text-lg font-bold break-words text-foreground">{name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function AboutIntroSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection>
      <Container className="pt-28 pb-14 sm:pt-36 sm:pb-20">
        <SectionHeading eyebrow="Company" heading="About DigiSay" level="h1" />
        <motion.div
          className="mt-8 max-w-3xl space-y-5"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 15 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            DigiSay is a leading media-tech enabling company in MENA.
          </h3>
          <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
            DigiSay focuses on the creator economy advancements which kickstarted the company's
            early days on YouTube with further business opportunities like working on the most
            successful and well-known projects in MENA's media industry.
          </p>
          <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
            DigiSay has extensive expertise in managing complex media challenges through strategic
            and technology-based approaches.
          </p>
        </motion.div>
      </Container>
    </AnimatedSection>
  );
}

export function ValuesSection() {
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-20">
        <SectionHeading eyebrow="Values" heading="Our Core Values" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="h-full"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
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
      <Container className="py-14 sm:py-20">
        <SectionHeading eyebrow="Group Companies" heading="DigiSay Group Companies" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupCompanies.map((g, i) => {
            const logo = groupCompanyLogos.find((l) => l.name === g.name);
            return (
              <motion.div
                key={g.name}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
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
      <Container className="py-14 sm:py-20">
        <SectionHeading eyebrow="Awards & Recognition" heading="The awards won by our projects" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {awards.map((a, i) => (
            <motion.div
              key={a.title}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <div className="group flex h-full flex-col justify-between items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 sm:p-8">
                <div className="flex h-44 w-full items-center justify-center overflow-hidden">
                  <img
                    src={a.img}
                    alt={a.title}
                    className="max-h-40 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 mt-6 border-t border-border/40 pt-4 w-full">
                  <p className="text-base font-bold break-words text-foreground sm:text-lg">
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
      <Container className="py-14 sm:py-20">
        <SectionHeading eyebrow="Team & Culture" heading="People Behind DigiSay" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {aboutTeamPhotos.map((p, i) => (
            <motion.div
              key={p.src}
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
            >
              <img
                src={p.src}
                alt="DigiSay team"
                className="h-64 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:h-80 lg:h-96"
                loading="lazy"
              />
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
      <Container className="py-14 sm:py-20">
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
              transition={{ duration: 0.4, delay: i * 0.04 }}
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
