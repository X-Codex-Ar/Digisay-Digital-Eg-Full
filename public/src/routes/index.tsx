import { createFileRoute } from "@tanstack/react-router";

import HomePage from "@/features/home/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Home - DigiSay" }],
  }),
  component: HomePage,
});
