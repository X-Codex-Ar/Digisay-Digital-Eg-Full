import { motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { blogCategories, blogPosts } from "@/data/blog";

import { BlogCard } from "./BlogCard";

export default function BlogListingPage() {
  const reduced = useReducedMotion();
  const recent = blogPosts.filter((p) => !p.category || p.category === "uncategorized");
  const featured = blogPosts.filter(
    (p) => p.category === "growth-marketing" || p.category === "anti-piracy",
  );
  const other = blogPosts.filter((p) => p.category === "digital-solutions");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20 bg-background">
        {/* Ambient brand glow */}
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
              Insights & Media Intelligence
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Latest News, Strategies & Industry Insights
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Stay ahead with deep dives into creator economics, digital rights protection, algorithmic
              growth, and media monetization across MENA and global markets.
            </p>

            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {blogCategories.map((c) => (
                <Link
                  key={c}
                  to={`/blog/category/${c}` as never}
                  className="rounded-2xl border border-border/80 bg-card/60 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:-translate-y-0.5"
                >
                  {c}
                </Link>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Main Grid Section */}
      <AnimatedSection className="border-t border-border/40 bg-muted/20">
        <Container className="py-16 sm:py-24">
          <SectionHeading
            eyebrow="Latest Articles"
            heading="Recent Publications"
            description="Explore our newest analyses and perspectives on media technology."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((p, i) => (
              <BlogCard key={p.slug} post={p} index={i} />
            ))}
          </div>

          {featured.length > 0 && (
            <div className="mt-20 border-t border-border/40 pt-16">
              <SectionHeading
                heading="Featured Highlights"
                eyebrow="Editor's Choice"
                description="Selected case studies and flagship thought leadership pieces."
              />
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((p, i) => (
                  <BlogCard key={p.slug} post={p} index={i} />
                ))}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div className="mt-20 border-t border-border/40 pt-16">
              <SectionHeading
                heading="Media & Solutions"
                eyebrow="Deep Dives"
                description="Technical and strategic walkthroughs for rights management and monetization."
              />
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {other.map((p, i) => (
                  <BlogCard key={p.slug} post={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </AnimatedSection>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
