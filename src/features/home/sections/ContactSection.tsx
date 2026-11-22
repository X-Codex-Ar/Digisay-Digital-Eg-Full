import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export function ContactSection() {
  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-16">
        <div className="max-w-3xl rounded-3xl border border-border bg-background p-8 text-center shadow-lg md:p-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Amazing opportunities often arise from a conversation. Reach out and let's talk
          </h2>
          <PrimaryButton to="/contact" className="mt-8">
            Let's Talk
          </PrimaryButton>
        </div>
      </Container>
    </AnimatedSection>
  );
}
