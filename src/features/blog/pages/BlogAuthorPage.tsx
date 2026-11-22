import { Link, useParams } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
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

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16 bg-background">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <Container className="relative z-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:underline mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Articles</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Author
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Articles by {author}
          </h1>
        </Container>
      </section>

      <AnimatedSection className="border-t border-border/40 bg-muted/20 pb-20 sm:pb-28">
        <Container className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <BlogCard key={p.slug} post={p} index={i} />
            ))}
          </div>
          {posts.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
              <p className="text-base text-muted-foreground">No articles by this author yet.</p>
              <Link
                to="/blog"
                className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:underline text-sm"
              >
                ← Return to Blog
              </Link>
            </div>
          )}
        </Container>
      </AnimatedSection>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
