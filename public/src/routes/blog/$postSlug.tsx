import { createFileRoute } from "@tanstack/react-router";

import BlogPostDetailPage from "@/features/blog/pages/BlogPostDetailPage";
import { getPostBySlug } from "@/data/blog";

export const Route = createFileRoute("/blog/$postSlug")({
  head: ({ params }) => ({
    meta: [
      {
        title: getPostBySlug(params.postSlug)?.title ?? "Post",
      },
    ],
  }),
  component: BlogPostDetailRoute,
});

function BlogPostDetailRoute() {
  const { postSlug } = Route.useParams();
  return <BlogPostDetailPage post={getPostBySlug(postSlug)} />;
}
