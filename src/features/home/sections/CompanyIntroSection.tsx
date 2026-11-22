import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";

export function CompanyIntroSection() {
  return (
    <AnimatedSection>
      <Container className="pb-16 pt-4 md:pb-20">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            Full-Stack Media Solutions
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Our clients describe us as a productive team who creates amazing experiences, by
            crafting top-notch user experience.
          </p>
        </div>
      </Container>
    </AnimatedSection>
  );
}
