import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import type { BlogPost } from "@/data/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-xl">
      {post.image ? (
        <ImageWithFallback src={post.image} alt={post.title} className="aspect-[16/10] w-full rounded-xl" />
      ) : null}
      <div className="flex flex-col gap-2">
        <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {post.category}
        </span>
        <Link
          to={post.to as never}
          className="text-base font-bold text-foreground transition-colors hover:text-primary"
        >
          {post.title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Posted by {post.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{format(new Date(post.date), "d MMM, yyyy")}</time>
        </div>
        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        <Link
          to={post.to as never}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Read more <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
