import { createFileRoute } from "@tanstack/react-router";

import BlogCategoryPage from "@/features/blog/pages/BlogCategoryPage";

export const Route = createFileRoute("/blog/category/$category")({
  head: () => ({
    meta: [{ title: "Blog category" }],
  }),
  component: BlogCategoryPage,
});
