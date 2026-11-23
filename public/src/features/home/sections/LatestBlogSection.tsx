import { motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { blogPosts } from "@/data/blog";
import { BlogCard } from "@/features/blog/pages/BlogCard";

export function LatestBlogSection() {
  const reduced = useReducedMotion();
  const posts = blogPosts.slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <AnimatedSection className="border-t border-border/40 bg-muted/30">
      <Container className="py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <SectionHeading eyebrow="Insights & Articles" heading="From the DigiSay Blog" />
          <Link
            to="/blog"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <span>View all articles</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <BlogCard post={p} />
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
