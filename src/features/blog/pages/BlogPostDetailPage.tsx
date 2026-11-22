import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Container } from "@/components/common/Container";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { blogPosts, type BlogPost } from "@/data/blog";

import { BlogCard } from "./BlogCard";

export default function BlogPostDetailPage({ post }: { post: BlogPost | undefined }) {
  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center p-16">
        <p className="text-base text-muted-foreground">This post was not found.</p>
      </div>
    );
  }
  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <AnimatedSection>
        <Container className="pt-28 pb-16 sm:pt-36 sm:pb-24">
          <Breadcrumbs
            items={[
              { label: "Blog", to: "/blog" },
              { label: post.title, active: true },
            ]}
          />
          <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="w-fit rounded-xl bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {post.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-foreground">Posted by {post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{format(new Date(post.date), "d MMM, yyyy")}</time>
          </div>
          {post.image && (
            <div className="mt-8">
              <ImageWithFallback
                src={post.image}
                alt={post.title}
                className="aspect-[16/9] w-full rounded-3xl"
              />
            </div>
          )}
          <div className="mt-10 max-w-3xl space-y-5">
            {post.content.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-16 border-t border-border/40 pt-12">
            <SectionHeading eyebrow="Related Articles" heading="You may also like" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
            <Link
              to="/blog"
              className="mt-8 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              ← Back to Blog
            </Link>
          </div>
        </Container>
      </AnimatedSection>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
