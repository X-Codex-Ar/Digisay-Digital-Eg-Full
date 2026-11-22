import { motion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { aboutPartners, aboutTeamPhotos, awards, groupCompanies, groupCompanyLogos, values } from "@/data/site";

function ValuesCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h4 className="text-base font-bold text-foreground">{title}</h4>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function GroupCompanyCard({ name, src, body }: { name: string; src: string; body: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <img src={src} alt={name} className="h-12 w-auto object-contain" loading="lazy" />
      <div>
        <h4 className="text-base font-bold text-foreground">{name}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function AboutIntroSection() {
  return (
    <AnimatedSection>
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Company" heading="About DigiSay" />
        <div className="mt-6 max-w-3xl space-y-4">
          <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
            DigiSay values itself in being a leading media-tech enabling company in MENA.
          </h3>
          <p className="text-base text-muted-foreground md:text-lg">
            DigiSay focuses on the creator economy advancements which kickstarted the company's early
            days on YouTube with further business opportunities like working on the most successful and
            well known projects in MENA's media industry.
          </p>
          <p className="text-base text-muted-foreground md:text-lg">
            DigiSay has extensive expertise in managing complex media challenges through strategic and
            technology based approaches.
          </p>
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function ValuesSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Values" heading="Core values" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}>
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
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupCompanies.map((g) => {
            const logo = groupCompanyLogos.find((l) => l.name === g.name);
            return <GroupCompanyCard key={g.name} name={g.name} body={g.body} src={logo?.src ?? "/assets/brand/Digisay-logo-big.jpg"} />;
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
        <ul className="mt-8 space-y-4">
          {awards.map((a) => (
            <li key={a.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-base font-bold text-foreground">{a.title}</p>
              <p className="text-sm text-muted-foreground">{a.by}</p>
              <p className="text-sm text-muted-foreground">{a.year}</p>
            </li>
          ))}
        </ul>
      </Container>
    </AnimatedSection>
  );
}

export function TeamPhotosSection() {
  if (aboutTeamPhotos.length === 0) return null;
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Team" heading="Our team" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutTeamPhotos.map((p) => (
            <img key={p.src} src={p.src} alt="DigiSay team" className="h-72 w-full rounded-2xl object-cover" loading="lazy" />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function PartnersSection() {
  if (aboutPartners.length === 0) return null;
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-16">
        <SectionHeading eyebrow="Partners" heading="Our partners and clients" />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {aboutPartners.map((p) => (
            <img key={p.name} src={p.src} alt={p.name} className="h-12 w-auto object-contain" loading="lazy" />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
