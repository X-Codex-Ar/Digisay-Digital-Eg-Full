import { useParams, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
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

      {/* Unified Signature Page Header */}
      <PageHeader
        badge="Category"
        icon={Sparkles}
        title={`Category: ${category.replace(/-/g, " ")}`}
        description={`Explore our curated articles, strategic analyses, and practical guides in ${category.replace(
          /-/g,
          " ",
        )}.`}
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
          {!all && (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
              <p className="text-base text-muted-foreground">No posts found in this category yet.</p>
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
