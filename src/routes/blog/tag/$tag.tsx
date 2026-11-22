import { createFileRoute } from "@tanstack/react-router";

import BlogTagPage from "@/features/blog/pages/BlogTagPage";

export const Route = createFileRoute("/blog/tag/$tag")({
  head: () => ({
    meta: [{ title: "Blog tag" }],
  }),
  component: BlogTagPage,
});
