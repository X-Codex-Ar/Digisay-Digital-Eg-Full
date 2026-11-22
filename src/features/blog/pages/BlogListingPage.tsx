import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { blogCategories, blogPosts } from "@/data/blog";

import { BlogCard } from "./BlogCard";

export default function BlogListingPage() {
  const recent = blogPosts.filter((p) => !p.category || p.category === "uncategorized");
  const featured = blogPosts.filter((p) => p.category === "growth-marketing" || p.category === "anti-piracy");
  const other = blogPosts.filter((p) => p.category === "digital-solutions");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="py-16">
          <SectionHeading eyebrow="Resources" heading="Blog" />
          <div className="mt-4 flex flex-wrap gap-2">
            {blogCategories.map((c) => (
              <Link
                key={c}
                to={`/blog/category/${c}` as never}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {c}
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
          {featured.length > 0 && (
            <div className="mt-10">
              <SectionHeading className="mb-6" heading="Featured" eyebrow="Articles" />
              <div className="grid gap-4 md:grid-cols-2">
                {featured.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          )}
          {other.length > 0 && (
            <div className="mt-10">
              <SectionHeading className="mb-6" heading="Insights" eyebrow="Our insights" />
              <div className="grid gap-4 md:grid-cols-2">
                {other.map((p) => (
                  <BlogCard key={p.slug} post={p} />
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
