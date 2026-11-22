import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { brand, offices } from "@/data/site";

export function ContactIntroSection() {
  return (
    <div className="px-4 sm:px-6 xl:px-8">
      <div className="mx-auto max-w-[1300px] rounded-3xl border border-border bg-background p-8 text-center shadow-lg md:p-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          How can we help you out? Reach out to us
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Fill in this form or send us an e-mail with your inquiry. Our UAE and U.S. offices are ready
          to work with you.
        </p>
      </div>
    </div>
  );
}

export function ContactDetailsSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="pb-8 pt-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-8">
            {offices.map((o) => (
              <div key={o.name}>
                <h4 className="text-base font-bold text-foreground">{o.name}</h4>
                <h5 className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Location
                </h5>
                <p className="mt-1 text-sm text-muted-foreground">{o.lines.join(" ")}</p>
                <h5 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  General inquiries
                </h5>
                <p className="mt-1 text-sm text-foreground">{brand.email}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Phone: {brand.phone}</p>
            <p>Hours: {brand.hours}</p>
            <p className="font-semibold text-foreground">Email: {brand.email}</p>
            <p className="mt-4">
              <a href="/anti-piracy" className="font-semibold text-foreground hover:text-primary">
                View services
              </a>
            </p>
          </div>
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function ContactCtaSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading heading="Join us to create the best digital solutions." />
      </Container>
    </AnimatedSection>
  );
}
