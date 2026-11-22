import { useParams } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { getPostsByTag, type BlogPost } from "@/data/blog";

import { BlogCard } from "./BlogCard";

export default function BlogTagPage() {
  const params = useParams({ strict: false }) as { tag: string };
  const tag = params.tag ?? "";
  const posts = getPostsByTag(tag) as BlogPost[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="py-16">
          <SectionHeading eyebrow="Tag" heading={`Tagged: ${tag}`} level="h1" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
          {posts.length === 0 && (
            <p className="mt-8 text-base text-muted-foreground">No posts with this tag.</p>
          )}
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
