import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { blogPosts } from "@/data/blog";

function BlogCard({ post }: { post: { title: string; excerpt: string; to: string } }) {
  return (
    <AnimatedSection>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Link to={post.to as never} className="text-base font-bold text-foreground transition-colors hover:text-primary">
          {post.title}
        </Link>
        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        <Link to={post.to as never} className="self-start text-sm font-semibold text-primary hover:underline">
          Read More →
        </Link>
      </div>
    </AnimatedSection>
  );
}

export function LatestBlogSection() {
  const posts = blogPosts.slice(0, 3);
  if (posts.length === 0) return null;
  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/40">
      <Container className="py-14 sm:py-16">
        <SectionHeading heading="From the Blog" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
