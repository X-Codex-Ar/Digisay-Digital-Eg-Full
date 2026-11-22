import { useParams } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { getPostsByCategory, type BlogPost } from "@/data/blog";

import { BlogCard } from "./BlogCard";

export default function BlogCategoryPage() {
  const params = useParams({ strict: false }) as { category: string };
  const category = params.category ?? "uncategorized";
  const posts = getPostsByCategory(category) as BlogPost[];
  const all = posts.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="pt-28 pb-16 sm:pt-36 sm:pb-24">
          <SectionHeading eyebrow="Category" heading={`Category: ${category}`} level="h1" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
          {!all && (
            <p className="mt-8 text-base text-muted-foreground">No posts in this category yet.</p>
          )}
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
