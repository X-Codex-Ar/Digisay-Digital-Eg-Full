import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { privacyBlocks } from "@/data/privacy";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="py-16">
          <div className="mx-auto max-w-3xl">
            {privacyBlocks.map((b, i) => {
              if (b.type === "heading") {
                return (
                  <h2 key={i} className="mt-10 text-2xl font-bold tracking-tight md:text-3xl">
                    {b.text}
                  </h2>
                );
              }
              if (b.type === "bullet") {
                return (
                  <div key={i} className="mt-1 list-disc pl-6 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {b.text}
                  </div>
                );
              }
              return (
                <p key={i} className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                  {b.text}
                </p>
              );
            })}
          </div>
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
