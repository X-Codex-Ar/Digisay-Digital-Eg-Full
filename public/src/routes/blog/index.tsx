import { createFileRoute } from "@tanstack/react-router";

import BlogListingPage from "@/features/blog/pages/BlogListingPage";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [{ title: "Blog - DigiSay" }],
  }),
  component: BlogListingPage,
});
