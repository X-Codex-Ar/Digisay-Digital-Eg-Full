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
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-border/80 sm:p-6">
      <h3 className="text-base font-bold break-words text-foreground sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function GroupCompanyCard({ name, src, body }: { name: string; src: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 text-center shadow-sm sm:p-6">
      <div className="flex h-12 w-full items-center justify-center">
        <img
          src={src}
          alt={name}
          className="max-h-12 w-auto max-w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="w-full min-w-0">
        <h3 className="text-base font-bold break-words text-foreground sm:text-lg">{name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function AboutIntroSection() {
  return (
    <AnimatedSection>
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Company" heading="About DigiSay" level="h1" />
        <div className="mt-6 max-w-3xl space-y-4">
          <h3 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            DigiSay values itself in being a leading media-tech enabling company in MENA.
          </h3>
          <p className="text-base text-muted-foreground md:text-lg">
            DigiSay focuses on the creator economy advancements which kickstarted the company's
            early days on YouTube with further business opportunities like working on the most
            successful and well known projects in MENA's media industry.
          </p>
          <p className="text-base text-muted-foreground md:text-lg">
            DigiSay has extensive expertise in managing complex media challenges through strategic
            and technology based approaches.
          </p>
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function ValuesSection() {
  const reduced = useReducedMotion();
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Values" heading="Core values" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="h-full"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
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
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Group companies" heading="DigiSay Group Companies" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groupCompanies.map((g) => {
            const logo = groupCompanyLogos.find((l) => l.name === g.name);
            return (
              <GroupCompanyCard
                key={g.name}
                name={g.name}
                body={g.body}
                src={logo?.src ?? "/assets/brand/Digisay-logo-big.jpg"}
              />
            );
          })}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function AwardsSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Awards" heading="The awards won by our projects." />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {awards.map((a) => (
            <li
              key={a.title}
              className="flex h-full flex-col items-center gap-5 rounded-2xl border border-border bg-card p-5 text-center shadow-sm sm:p-6"
            >
              <img
                src={a.img}
                alt={a.title}
                className="h-36 w-auto max-w-full object-contain sm:h-44"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-base font-bold break-words text-foreground sm:text-lg">
                  {a.title} <em className="font-medium italic text-muted-foreground">{a.year}</em>
                </p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{a.by}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </AnimatedSection>
  );
}

export function TeamPhotosSection() {
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Team" heading="Our team" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {aboutTeamPhotos.map((p) => (
            <img
              key={p.src}
              src={p.src}
              alt="DigiSay team"
              className="h-56 w-full rounded-2xl object-cover sm:h-72 lg:h-80"
              loading="lazy"
            />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function PartnersSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Partners" heading="Our partners and clients" />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:gap-x-8 sm:gap-y-6">
          {aboutPartners.map((p) => (
            <img
              key={p.name}
              src={p.src}
              alt={p.name}
              className="h-8 w-auto max-w-full object-contain sm:h-10 md:h-12"
              loading="lazy"
            />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
