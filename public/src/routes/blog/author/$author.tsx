import { createFileRoute } from "@tanstack/react-router";

import BlogAuthorPage from "@/features/blog/pages/BlogAuthorPage";

export const Route = createFileRoute("/blog/author/$author")({
  head: () => ({
    meta: [{ title: "Blog author" }],
  }),
  component: BlogAuthorPage,
});
