import { Link, useParams } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
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

      {/* Unified Signature Page Header */}
      <PageHeader
        badge="Author Profile"
        icon={Sparkles}
        title={`Articles by ${author}`}
        description={`Browse thought leadership and media technology analysis written by ${author}.`}
      >
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>All Articles</span>
        </Link>
      </PageHeader>

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
