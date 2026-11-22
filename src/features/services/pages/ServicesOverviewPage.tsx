import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export default function ServicesOverviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="py-16">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            We make strategies, design & development to create valuable products.
          </h1>
          <h2 className="mt-10 text-2xl font-bold md:text-3xl lg:text-4xl">
            Creative studio with art & technologies.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold md:text-xl">
                Full-stack Enterprise Media Management
              </h3>
              <p className="mt-2 text-muted-foreground">
                Regulatory oneven an enterprises such she and the got the did attributing and
                pushed.
              </p>
              <p className="mt-2 text-muted-foreground">
                We currently have 36 active media campaigns across 24 projects.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold md:text-xl">Google Analytics & Measurement</h3>
              <p className="mt-2 text-muted-foreground">
                Spaces of each debt in the digital world can help you with overall simplest
                authentic;
              </p>
              <p className="mt-2 text-muted-foreground">
                Get an utilized of structure to tackle complex issues and changes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold md:text-xl">UX/UI Design & Website/App Design</h3>
              <p className="mt-2 text-muted-foreground">
                A higher spacing and movements through an impactful email campaigns;
              </p>
              <p className="mt-2 text-muted-foreground">
                Creating a portfolio budgeting in a real time planning and phasing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold md:text-xl">
                Marketing Campaigns & Content Creation
              </h3>
              <p className="mt-2 text-muted-foreground">
                Making a shor time up to date email campaings to achieve a real impact.
              </p>
            </div>
          </div>
          <h2 className="mt-12 text-2xl font-bold md:text-3xl lg:text-4xl">
            We're changing the way people think of UI/UX creation.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A full-stack structure for our working workflow processes , were from the funny the
            century initial all the made, have spare to negatives.
          </p>
          <h2 className="mt-10 text-2xl font-bold md:text-3xl lg:text-4xl">
            Project by the numbers.
          </h2>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>web and mobile apps designs</p>
            <p>Creating a full range UI/UX apps accross the whole platform.</p>
            <p>API Integrations</p>
            <p>Software-enabled platforms to completely change the way of UI/UX iterations.</p>
            <p>awards for digital innovation</p>
            <p>We have strict intentions to completely change the way of UI/UX creation.</p>
          </div>
          <h2 className="mt-12 text-2xl font-bold md:text-3xl lg:text-4xl">Awards.</h2>
          <h2 className="mt-6 text-2xl font-bold md:text-3xl lg:text-4xl">
            We believe that people are essential.
          </h2>
          <h2 className="mt-6 text-2xl font-bold md:text-3xl lg:text-4xl">
            Working in the fields of UI/UX design and art direction.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
          </div>
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
