import { createFileRoute } from "@tanstack/react-router";

import AboutPage from "@/features/about/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "About - DigiSay" }],
  }),
  component: AboutPage,
});
