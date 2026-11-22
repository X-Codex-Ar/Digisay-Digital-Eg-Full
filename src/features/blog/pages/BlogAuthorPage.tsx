import { Link, useParams } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { getPostsByAuthor, type BlogPost } from "@/data/blog";

import { BlogCard } from "./BlogCard";

export default function BlogAuthorPage() {
  const params = useParams({ strict: false }) as { author: string };
  const author = params.author ?? "";
  const posts = getPostsByAuthor(author) as BlogPost[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="pt-28 pb-16 sm:pt-36 sm:pb-24">
          <SectionHeading eyebrow="Author" heading={`Posts by ${author}`} />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
          {posts.length === 0 && (
            <p className="mt-8 text-base text-muted-foreground">
              <Link to="/blog" className="font-semibold text-primary hover:underline">
                Back to Blog
              </Link>
            </p>
          )}
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
