import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";

import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import type { BlogPost } from "@/data/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      <div>
        {post.image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted/40">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {post.category || "Insight"}
            </span>
            <time
              dateTime={post.date}
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              {format(new Date(post.date), "d MMM, yyyy")}
            </time>
          </div>

          <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
            <Link to={post.to as never} className="line-clamp-2">
              {post.title}
            </Link>
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 text-xs">
        <span className="font-medium text-muted-foreground truncate">
          By <strong className="text-foreground">{post.author}</strong>
        </span>
        <Link
          to={post.to as never}
          className="inline-flex items-center gap-1 font-semibold text-primary transition-transform duration-200 group-hover:translate-x-1"
        >
          <span>Read more</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
